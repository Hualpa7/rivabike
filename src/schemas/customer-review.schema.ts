import { z } from 'zod';

export const customerReviewSchema = z.object({
  nombre_visible: z
    .string()
    .min(1, 'Ingresá un nombre para mostrar.')
    .max(100, 'El nombre no puede superar los 100 caracteres.'),
  rating: z
    .number({ required_error: 'Seleccioná un puntaje.' })
    .int()
    .min(1, 'Seleccioná al menos 1 estrella.')
    .max(5, 'Máximo 5 estrellas.'),
  texto: z
    .string()
    .min(1, 'Escribí tu reseña.')
    .max(500, 'La reseña no puede superar los 500 caracteres.'),
});

export type CustomerReviewValues = z.infer<typeof customerReviewSchema>;
