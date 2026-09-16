import { useState } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  customerReviewSchema,
  type CustomerReviewValues,
} from '@/schemas/customer-review.schema';
import {
  useCreateCustomerReview,
  useUpdateCustomerReview,
  useUploadCustomerReviewPhoto,
} from '@/features/reviews/api';
import type { CustomerReviewWithPhotos } from '@/types';
import {
  Button,
  Field,
  Input,
  Textarea,
  StarRatingInput,
  ReviewPhotoUpload,
  MAX_REVIEW_PHOTOS,
} from '@/components/ui';
import { StarIcon } from '@/components/ui/icons';

const MAX_TEXT = 500;

interface ReviewFormProps {
  /** Si se provee, edita esa reseña; si no, crea una nueva. */
  review?: CustomerReviewWithPhotos | null;
  /** Callback para cerrar el formulario cuando termina. */
  onDone: () => void;
  /** Deshabilita el botón de guardar (ej. al llegar al límite de pendientes). */
  createDisabled?: boolean;
  /** Mensaje a mostrar cuando el botón de crear está deshabilitado. */
  createDisabledReason?: string;
}

export function ReviewForm({ review, onDone, createDisabled, createDisabledReason }: ReviewFormProps) {
  const [photos, setPhotos] = useState<File[]>([]);
  const existingPhotos = review?.photos ?? [];
  const isEdit = Boolean(review);

  const createReview = useCreateCustomerReview();
  const updateReview = useUpdateCustomerReview();
  const uploadPhoto = useUploadCustomerReviewPhoto();

  const {
    register,
    handleSubmit,
    control,
    setValue,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<CustomerReviewValues>({
    resolver: zodResolver(customerReviewSchema),
    defaultValues: {
      nombre_visible: review?.nombre_visible ?? '',
      rating: review?.rating ?? 0,
      texto: review?.texto ?? '',
    },
  });

  const textValue = watch('texto');

  const onSubmit = async (values: CustomerReviewValues) => {
    try {
      if (isEdit && review) {
        await updateReview.mutateAsync({
          review_id: review.id,
          nombre_visible: values.nombre_visible,
          rating: values.rating,
          texto: values.texto,
        });
      } else {
        const created = await createReview.mutateAsync(values);
        // Subir fotos nuevas una vez creada la reseña (necesita el review_id).
        if (photos.length) {
          await Promise.all(
            photos.map((file) =>
              uploadPhoto.mutateAsync({ reviewId: created.id, file }),
            ),
          );
        }
      }
      onDone();
    } catch (e) {
      console.error('Guardar reseña', e);
    }
  };

  const handleText = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    // Bloquea la escritura pasada el límite real (no solo avisa).
    if (e.target.value.length > MAX_TEXT) {
      e.target.value = e.target.value.slice(0, MAX_TEXT);
    }
    setValue('texto', e.target.value, { shouldValidate: true });
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-5">
      <Field label="Nombre visible" htmlFor="rf-nombre" error={errors.nombre_visible?.message} required>
        <Input
          id="rf-nombre"
          autoComplete="name"
          placeholder="Cómo querés que te mostremos"
          invalid={!!errors.nombre_visible}
          {...register('nombre_visible')}
        />
      </Field>

      <Field label="Tu puntaje" htmlFor="rf-rating" error={errors.rating?.message} required>
        <Controller
          control={control}
          name="rating"
          render={({ field }) => (
            <StarRatingInput
              name="rating"
              value={field.value}
              onChange={field.onChange}
            />
          )}
        />
      </Field>

      <Field label="Tu reseña" htmlFor="rf-texto" error={errors.texto?.message} required>
        <Textarea
          id="rf-texto"
          rows={4}
          placeholder="Contanos cómo te fue con tu bici…"
          invalid={!!errors.texto}
          value={textValue}
          maxLength={MAX_TEXT}
          onChange={handleText}
        />
        <span className="mt-1 block text-right text-xs text-muted">
          {textValue?.length ?? 0}/{MAX_TEXT}
        </span>
      </Field>

      <div>
        <span className="mb-1.5 block text-sm font-medium text-ink">Fotos <span className="text-pink-deep">*</span></span>
        <p className="mb-2 text-[13px] font-medium text-ink">
          <StarIcon size={14} className="mr-1 inline text-gold" />
          Hasta {MAX_REVIEW_PHOTOS} fotos de tu bici.
        </p>
        <ReviewPhotoUpload
          photos={photos}
          onAdd={(files) => setPhotos((p) => [...p, ...files].slice(0, MAX_REVIEW_PHOTOS))}
          onRemove={(i) => setPhotos((p) => p.filter((_, idx) => idx !== i))}
        />
        {existingPhotos.length ? (
          <div className="mt-3 flex flex-wrap gap-3">
            {existingPhotos.map((p) => (
              <div key={p.id} className="relative h-20 w-20 overflow-hidden rounded-card border border-line">
                <img src={p.storage_path} alt="Foto ya subida" className="h-full w-full object-cover" />
              </div>
            ))}
          </div>
        ) : null}
      </div>

      {createDisabled ? (
        <p className="rounded-card border border-line bg-[var(--surface-2)] px-4 py-3 text-sm text-muted">
          {createDisabledReason ?? 'No se pueden crear más reseñas por ahora.'}
        </p>
      ) : null}

      <Button type="submit" variant="primary" block loading={isSubmitting} disabled={createDisabled}>
        {isEdit ? 'Guardar cambios' : 'Publicar reseña'}
      </Button>
    </form>
  );
}
