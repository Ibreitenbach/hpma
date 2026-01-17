/**
 * Content loader for Field Guide.
 *
 * For client-side usage, import directly from content-bundle.ts (auto-generated).
 * This file provides utilities for working with the content.
 */

import { ContentBundle } from './types';
import { contentBundle } from './content-bundle';

export function loadContent(): ContentBundle {
  return contentBundle;
}
