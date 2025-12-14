import React, { useState } from "react";
import { StepEightEnhanced } from "../components/convert/StepEightEnhanced";

/**
 * מזהה בנייה – מיושר ל־Backend (buildId בלבד)
 */
interface BuildIds {
  appId: string;
  buildId: string;
}

const Convert: React.FC = () => {
  const [step] = useState<number>(8);

  const [buildIds, setBuildIds] = useState<BuildIds | null>(null);

  /**
   * נקרא אחרי שה־backend מחזיר תוצאת בנייה
   * שים לב: אין jobId בשום מקום
   */
  const handleBuildResult = (
    newAppId: string,
    buildResult: {
      buildId: string;
      status: string;
      estimatedTime: number;
      message: string;
      buildsRemaining: number;
    }
  ) => {
    setBuildIds({
      appId: newAppId,
      buildId: buildResult.buildId,
    });
  };

  const handleComplete = () => {
    if (!buildIds) return;
    console.log("Conversion completed:", buildIds);
  };

  return (
    <div>
      {step === 8 && (
        <StepEightEnhanced
          resultUrl={
            buildIds ? `/builds/${buildIds.buildId}` : undefined
          }
          onComplete={handleComplete}
        />
      )}
    </div>
  );
};

export default Convert;
