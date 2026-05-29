import { createC2pa } from 'c2pa-node';
import ExifReader from 'exifreader';

export interface C2paResult {
  hasC2pa: boolean;
  producer?: string;
  edits?: any[];
  isAiGenerated?: boolean;
  isEdited?: boolean;
  exifDetails?: any;
}
export const scanImageForC2PA = async (buffer: Buffer, mimeType: string): Promise<C2paResult> => {
  let exifOrigin = 'Unknown';
  let exifDetails: any = {};
  try {
    const tags = await ExifReader.load(buffer);
    const make = tags['Make']?.description;
    const model = tags['Model']?.description;
    if (make || model) {
      exifOrigin = [make, model].filter(Boolean).join(' ');
    }
    
    const width = tags['Image Width']?.description || tags['ImageWidth']?.description;
    const height = tags['Image Height']?.description || tags['ImageLength']?.description;
    if (width && height) {
      exifDetails.resolution = `${width} x ${height}`;
    }
    
    if (tags['ISOSpeedRatings']?.description) {
      exifDetails.iso = tags['ISOSpeedRatings'].description;
    }
    if (tags['FocalLength']?.description) {
      exifDetails.focalLength = tags['FocalLength'].description;
    }
    if (tags['GPSLatitude']?.description && tags['GPSLongitude']?.description) {
      let lat = parseFloat(tags['GPSLatitude'].description);
      let lon = parseFloat(tags['GPSLongitude'].description);
      
      const latRefTag = tags['GPSLatitudeRef']?.value || tags['GPSLatitudeRef']?.description;
      const lonRefTag = tags['GPSLongitudeRef']?.value || tags['GPSLongitudeRef']?.description;
      const latRef = Array.isArray(latRefTag) ? latRefTag[0] : latRefTag;
      const lonRef = Array.isArray(lonRefTag) ? lonRefTag[0] : lonRefTag;

      if (typeof latRef === 'string' && latRef.toUpperCase() === 'S') lat *= -1;
      if (typeof lonRef === 'string' && lonRef.toUpperCase() === 'W') lon *= -1;

      exifDetails.lat = lat;
      exifDetails.lon = lon;
    }
  } catch (e) {
    // Ignore EXIF parsing errors
  }

  try {
    const c2pa = await createC2pa();
    const result = await c2pa.read({ buffer, mimeType });

    if (!result || !result.active_manifest) {
      return { hasC2pa: false, producer: exifOrigin, isAiGenerated: false, isEdited: false, exifDetails };
    }

    const manifest = result.active_manifest;
    
    const producer = manifest.claim_generator || (exifOrigin !== 'Unknown' ? exifOrigin : 'Unknown');

    // Safely parse assertions which can be structured differently based on the manifest
    const assertions = Array.isArray(manifest.assertions) ? manifest.assertions : manifest.assertions?.data || [];
    const actionsAssertion = assertions.find((a: any) => a.label === 'c2pa.actions' || a.label === 'actions');
    const edits = actionsAssertion?.data?.action || actionsAssertion?.data?.actions || actionsAssertion?.actions || [];

    const isEdited = edits.some((e: any) => e.action !== 'c2pa.created');
    
    // Heuristic for AI generation
    const aiGenerators = ['firefly', 'midjourney', 'dall-e', 'openai', 'stability'];
    const isAiGenerated = aiGenerators.some(gen => producer.toLowerCase().includes(gen)) || edits.some((e: any) => e.action?.includes('c2pa.created'));

    return {
      hasC2pa: true,
      producer,
      edits,
      isAiGenerated,
      isEdited,
      exifDetails
    };
  } catch (error) {
    console.error('Failed to read C2PA metadata:', error);
    return { hasC2pa: false, producer: exifOrigin, isAiGenerated: false, isEdited: false, exifDetails };
  }
};
