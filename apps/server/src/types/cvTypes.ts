// Raw shape returned by getDetections-api (Alex-Lekov template)
export type CVApiJsonDetectionRaw = {
    name: string;
    confidence: number;
};

export type CVApiJsonResponseRaw = {
    detect_objects: CVApiJsonDetectionRaw[];
    detect_objects_names: string;
};

// Your normalized, camelCase shape used inside the orchestrator
export type Detection = {
    label: string;
    confidence: number;
};

export type CVModelOutput = {
    detections: Detection[];
    labelsCsv: string; // mirror of detect_objects_names for convenience
};

// Map raw -> normalized (call this ASAP after fetching)
export function normalizeFromCvApiJson(raw: CVApiJsonResponseRaw): CVModelOutput {
    return {
        detections: raw.detect_objects.map(o => ({
            label: o.name,
            confidence: Number(o.confidence),
        })),
        labelsCsv: raw.detect_objects_names,
    };
}
