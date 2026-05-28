import { createC2pa } from 'c2pa-node';

export interface C2paResult {
  hasC2pa: boolean;
  producer?: string;
  edits?: any[];
}

export const scanImageForC2PA = async (buffer: Buffer, mimeType: string): Promise<C2paResult> => {
  try {
    const c2pa = await createC2pa();
    const result = await c2pa.read({ buffer, mimeType });

    if (!result || !result.active_manifest) {
      return { hasC2pa: false };
    }

    const manifest = result.active_manifest;
    
    const producer = manifest.claim_generator || 'Unknown';

    const actionsAssertion = manifest.assertions?.data?.find((a: any) => a.label === 'c2pa.actions');
    const edits = actionsAssertion?.data?.actions || [];

    return {
      hasC2pa: true,
      producer,
      edits
    };
  } catch (error) {
    console.error('Failed to read C2PA metadata:', error);
    return { hasC2pa: false };
  }
};
