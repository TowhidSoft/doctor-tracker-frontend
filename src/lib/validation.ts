/** Mirrors the API's Zod rules so the form and the server accept exactly the same input. */
export const PHONE_PATTERN = /^[0-9+\-()\s]{7,20}$/;
export const PHONE_MESSAGE = "Use 7–20 digits; + - ( ) and spaces are allowed";

export const GENDERS = ["Male", "Female", "Others"] as const;
export type Gender = (typeof GENDERS)[number];
