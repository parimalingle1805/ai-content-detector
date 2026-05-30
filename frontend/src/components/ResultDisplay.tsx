import React from 'react';
import { motion } from 'framer-motion';
import { type ScanResultPayload } from './Scanner';
import { CheckCircle, AlertTriangle, Edit3, HelpCircle, Info, Aperture, Maximize, Camera, MapPin } from 'lucide-react';

interface ResultDisplayProps {
  result: ScanResultPayload;
}

const ResultDisplay: React.FC<ResultDisplayProps> = ({ result }) => {
  const isImage = result.type === 'image';
  
  // Text analysis state logic
  const isTextAI = !isImage && result.isWatermarked;
  
  // Image analysis 5-state logic
  const isAiGenerated = isImage && result.isAiGenerated;
  const isEdited = isImage && result.isEdited && !isAiGenerated;
  const isVerified = isImage && result.hasC2pa && !isAiGenerated && !isEdited;
  const isClaimedOrigin = isImage && !result.hasC2pa && result.producer && result.producer !== 'Unknown';
  const isUnknown = isImage && !result.hasC2pa && (!result.producer || result.producer === 'Unknown');

  // Display configurations
  let badgeColor = 'bg-slate-500/10 text-slate-400';
  let Icon = HelpCircle;
  let title = 'Analysis Result';
  let subtext = '';

  if (isImage) {
    if (isAiGenerated) {
      badgeColor = 'bg-red-500/10 text-red-500 border-red-500/20';
      Icon = AlertTriangle;
      title = 'AI Generation Detected';
      subtext = 'We detected strong indicators of synthetic AI generation.';
    } else if (isEdited) {
      badgeColor = 'bg-amber-500/10 text-amber-500 border-amber-500/20';
      Icon = Edit3;
      title = 'Modifications Detected';
      subtext = 'This appears to be a physical capture, but modifications were detected.';
    } else if (isVerified) {
      badgeColor = 'bg-lime-500/10 text-lime-400 border-lime-500/20';
      Icon = CheckCircle;
      title = 'Cryptographically Verified';
      subtext = 'Valid C2PA signature found. Content appears authentic and unmodified.';
    } else if (isClaimedOrigin) {
      badgeColor = 'bg-blue-500/10 text-blue-400 border-blue-500/20';
      Icon = Info;
      title = 'Standard Metadata Found';
      subtext = 'Cryptographic signature missing, but standard EXIF origin claimed.';
    } else if (isUnknown) {
      badgeColor = 'bg-slate-700/50 text-slate-400 border-slate-600/50';
      Icon = HelpCircle;
      title = 'Unverified Origin';
      subtext = 'No cryptographic metadata found. This was likely stripped by a cloud provider or web download.';
    }
  } else {
    // Text states
    if (isTextAI) {
      badgeColor = 'bg-red-500/10 text-red-500 border-red-500/20';
      Icon = AlertTriangle;
      title = 'AI Generation Detected';
      subtext = 'We detected strong indicators of synthetic AI generation.';
    } else {
      badgeColor = 'bg-lime-500/10 text-lime-400 border-lime-500/20';
      Icon = CheckCircle;
      title = 'Text Analysis';
      subtext = 'No AI signatures detected. Content appears authentic.';
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      transition={{ duration: 0.4, ease: 'easeOut' }}
      className="w-full mt-8 bg-[#020617]"
    >
      <div className={`flex flex-col ${result.thumbnailUrl ? 'lg:flex-row' : ''} gap-8 items-start`}>
        {result.thumbnailUrl && (
          <div className="w-full lg:w-1/2 bg-slate-900/50 rounded-xl border border-slate-700 p-2 flex justify-center">
            <img src={result.thumbnailUrl} alt="Analyzed media" className="w-full max-h-80 object-contain rounded-lg shadow-sm" />
          </div>
        )}

        <div className={`flex flex-col gap-6 w-full ${result.thumbnailUrl ? 'lg:w-1/2' : ''}`}>
          <div className="bg-slate-800 border border-slate-700 rounded-3xl p-8 shadow-2xl">
            <div className="flex items-start gap-6">
              <div className={`p-4 rounded-2xl border ${badgeColor}`}>
                <Icon className="w-8 h-8" />
              </div>
              
              <div className="flex-1 min-w-0">
                <h2 className="text-2xl font-bold text-white mb-2">
                  {title}
                </h2>
                <p className="text-slate-400 mb-6 text-lg">
                  {subtext}
                </p>

                <div className="w-full bg-slate-900 rounded-xl p-3 md:p-5 border border-slate-800 space-y-4 overflow-hidden">
                  {isImage ? (
                    <>
                      <div className="flex justify-between items-center">
                        <span className="text-slate-400 font-medium">Origin Metadata</span>
                        <span className="text-white font-semibold bg-slate-800 px-3 py-1 rounded-lg">
                          {result.producer || 'Unknown'}
                        </span>
                      </div>
                      
                      {result.exifDetails && (result.exifDetails.iso || result.exifDetails.focalLength || result.exifDetails.resolution) && (
                        <div className="pt-4 border-t border-slate-800">
                          <span className="text-slate-400 font-medium block mb-3">Camera Details</span>
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 md:gap-4">
                            {result.exifDetails.resolution && (
                              <div className="flex flex-col gap-1 p-3 bg-slate-800/50 rounded-lg border border-slate-700/50">
                                <div className="flex items-center gap-2 text-slate-400 text-xs">
                                  <Maximize className="w-3 h-3" />
                                  <span>Resolution</span>
                                </div>
                                <span className="text-white text-sm font-medium break-words">{result.exifDetails.resolution}</span>
                              </div>
                            )}
                            {result.exifDetails.focalLength && (
                              <div className="flex flex-col gap-1 p-3 bg-slate-800/50 rounded-lg border border-slate-700/50">
                                <div className="flex items-center gap-2 text-slate-400 text-xs">
                                  <Camera className="w-3 h-3" />
                                  <span>Focal Length</span>
                                </div>
                                <span className="text-white text-sm font-medium break-words">{result.exifDetails.focalLength}</span>
                              </div>
                            )}
                            {result.exifDetails.iso && (
                              <div className="flex flex-col gap-1 p-3 bg-slate-800/50 rounded-lg border border-slate-700/50">
                                <div className="flex items-center gap-2 text-slate-400 text-xs">
                                  <Aperture className="w-3 h-3" />
                                  <span>ISO</span>
                                </div>
                                <span className="text-white text-sm font-medium break-words">{result.exifDetails.iso}</span>
                              </div>
                            )}
                          </div>
                        </div>
                      )}

                      {result.exifDetails && result.exifDetails.lat && result.exifDetails.lon && (
                        <div className="pt-4 border-t border-slate-800">
                          <span className="text-slate-400 font-medium flex items-center gap-2 mb-3">
                              <MapPin className="w-4 h-4" /> 
                              GPS Location
                          </span>
                          <iframe 
                            src={`https://www.openstreetmap.org/export/embed.html?bbox=${parseFloat(result.exifDetails.lon as any) - 0.02},${parseFloat(result.exifDetails.lat as any) - 0.02},${parseFloat(result.exifDetails.lon as any) + 0.02},${parseFloat(result.exifDetails.lat as any) + 0.02}&layer=mapnik&marker=${result.exifDetails.lat},${result.exifDetails.lon}`}
                            className="w-full h-48 rounded-xl border border-slate-700 mt-4 invert hue-rotate-180 brightness-90 contrast-125"
                          />
                        </div>
                      )}

                      {result.edits && result.edits.length > 0 && (
                        <div className="pt-4 border-t border-slate-800">
                          <span className="text-slate-400 font-medium block mb-3">Detected Modifications</span>
                          <ul className="space-y-2">
                            {result.edits.map((edit: any, idx: number) => (
                              <li key={idx} className="flex items-center gap-2 text-sm text-slate-300">
                                <div className="w-1.5 h-1.5 rounded-full bg-amber-500"></div>
                                {edit.action}
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </>
                  ) : (
                    <div className="flex justify-between items-center">
                      <span className="text-slate-400 font-medium">SynthID Confidence</span>
                      <span className="text-white font-semibold bg-slate-800 px-3 py-1 rounded-lg">
                        {result.score ? `${(result.score * 100).toFixed(1)}%` : '0%'}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default ResultDisplay;
