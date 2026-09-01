// Edge Function: google-reviews
//
// Devuelve EXACTAMENTE la forma `GoogleReviewsSummary` de docs/data-contract.md:
//
//   interface GoogleReview {
//     author_name: string;
//     author_url: string | null;
//     profile_photo_url: string | null;
//     rating: number;
//     text: string;
//     relative_time_description: string;
//   }
//   interface GoogleReviewsSummary {
//     rating: number;
//     total_reviews: number;
//     reviews: GoogleReview[];
//   }
//
// El contrato no define una forma de error separada para este hook
// (useGoogleReviews(): UseQueryResult<GoogleReviewsSummary>), así que esta
// función SIEMPRE responde 200 con esa forma exacta -- incluso cuando falta
// configurar el Place ID o la API key, devuelve { rating: 0,
// total_reviews: 0, reviews: [] } en vez de inventar un shape de error
// distinto. El detalle del problema queda en los logs de la función
// (revisables con query_logs), nunca en el body de la respuesta.
//
// La API key de Google (GOOGLE_MAPS_API_KEY) es un secret del proyecto:
// nunca se expone al navegador.
//
// Cache interno en public.google_reviews_cache (con columnas propias, no
// atadas al contrato) para minimizar llamadas repetidas a Google
// (AGENT.md sección 12).

import { createClient } from "npm:@supabase/supabase-js@2";

const CACHE_TTL_MS = 6 * 60 * 60 * 1000; // 6 horas

const FIELD_MASK = [
  "id",
  "displayName",
  "rating",
  "userRatingCount",
  "googleMapsUri",
  "reviews.rating",
  "reviews.text",
  "reviews.relativePublishTimeDescription",
  "reviews.publishTime",
  "reviews.authorAttribution",
].join(",");

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

interface GoogleReview {
  author_name: string;
  author_url: string | null;
  profile_photo_url: string | null;
  rating: number;
  text: string;
  relative_time_description: string;
}

interface GoogleReviewsSummary {
  rating: number;
  total_reviews: number;
  reviews: GoogleReview[];
}

const EMPTY_SUMMARY: GoogleReviewsSummary = {
  rating: 0,
  total_reviews: 0,
  reviews: [],
};

function summaryResponse(body: GoogleReviewsSummary) {
  return new Response(JSON.stringify(body), {
    status: 200,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}

// Mapea una fila de la tabla de cache interna (que sí puede tener columnas
// propias como business_name/fetched_at/place_id) a la forma pública del
// contrato.
// deno-lint-ignore no-explicit-any
function cacheRowToSummary(row: any): GoogleReviewsSummary {
  return {
    rating: row.rating ?? 0,
    total_reviews: row.user_rating_count ?? 0,
    // deno-lint-ignore no-explicit-any
    reviews: (row.reviews ?? []).map((r: any) => ({
      author_name: r.author_name ?? "Anónimo",
      author_url: r.author_url ?? null,
      profile_photo_url: r.profile_photo_url ?? null,
      rating: r.rating ?? 0,
      text: r.text ?? "",
      relative_time_description: r.relative_time_description ?? "",
    })),
  };
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL");
    const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
    const googleApiKey = Deno.env.get("GOOGLE_MAPS_API_KEY");

    if (!supabaseUrl || !serviceRoleKey) {
      console.error("Faltan variables de entorno internas de Supabase.");
      return summaryResponse(EMPTY_SUMMARY);
    }

    const supabase = createClient(supabaseUrl, serviceRoleKey);

    const { data: settings, error: settingsError } = await supabase
      .from("site_settings")
      .select("google_place_id")
      .single();

    if (settingsError) {
      console.error("Error leyendo site_settings:", settingsError);
      return summaryResponse(EMPTY_SUMMARY);
    }

    const placeId = settings?.google_place_id as string | null;

    if (!placeId) {
      console.log("google_place_id no configurado en site_settings.");
      return summaryResponse(EMPTY_SUMMARY);
    }

    const { data: cached } = await supabase
      .from("google_reviews_cache")
      .select("*")
      .eq("place_id", placeId)
      .maybeSingle();

    const isFresh =
      !!cached &&
      Date.now() - new Date(cached.fetched_at).getTime() < CACHE_TTL_MS;

    if (isFresh) {
      return summaryResponse(cacheRowToSummary(cached));
    }

    if (!googleApiKey) {
      console.log("GOOGLE_MAPS_API_KEY no configurada todavía.");
      if (cached) {
        // Sin API key pero con cache vieja: mejor mostrar algo
        // desactualizado que nada.
        return summaryResponse(cacheRowToSummary(cached));
      }
      return summaryResponse(EMPTY_SUMMARY);
    }

    const googleRes = await fetch(
      `https://places.googleapis.com/v1/places/${placeId}`,
      {
        headers: {
          "X-Goog-Api-Key": googleApiKey,
          "X-Goog-FieldMask": FIELD_MASK,
        },
      },
    );

    if (!googleRes.ok) {
      const errText = await googleRes.text();
      console.error("Google Places API error:", googleRes.status, errText);
      if (cached) {
        return summaryResponse(cacheRowToSummary(cached));
      }
      return summaryResponse(EMPTY_SUMMARY);
    }

    const googleData = await googleRes.json();

    // deno-lint-ignore no-explicit-any
    const rawReviews = (googleData.reviews ?? []).map((r: any) => ({
      author_name: r.authorAttribution?.displayName ?? "Anónimo",
      author_url: r.authorAttribution?.uri ?? null,
      profile_photo_url: r.authorAttribution?.photoUri ?? null,
      rating: r.rating ?? 0,
      text: r.text?.text ?? "",
      relative_time_description: r.relativePublishTimeDescription ?? "",
    }));

    // Fila de cache interna: puede llevar columnas extra (business_name,
    // google_maps_uri) que no forman parte del contrato público pero sirven
    // para debug/uso futuro.
    const cacheRow = {
      place_id: placeId,
      business_name: googleData.displayName?.text ?? null,
      rating: googleData.rating ?? null,
      user_rating_count: googleData.userRatingCount ?? null,
      google_maps_uri: googleData.googleMapsUri ?? null,
      reviews: rawReviews,
      fetched_at: new Date().toISOString(),
    };

    const { error: upsertError } = await supabase
      .from("google_reviews_cache")
      .upsert(cacheRow, { onConflict: "place_id" });

    if (upsertError) {
      console.error("Error guardando cache de reviews:", upsertError);
    }

    return summaryResponse({
      rating: cacheRow.rating ?? 0,
      total_reviews: cacheRow.user_rating_count ?? 0,
      reviews: rawReviews,
    });
  } catch (err) {
    console.error("google-reviews function error:", err);
    return summaryResponse(EMPTY_SUMMARY);
  }
});
