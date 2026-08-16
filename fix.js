const fs = require('fs');
let indexCode = fs.readFileSync('src/app/(tabs)/index.tsx', 'utf8');

if (!indexCode.includes('import { Coordinate, Address }')) {
    indexCode = "import { Coordinate, Address } from '../../types/location';\n" + indexCode;
}
if (!indexCode.includes('import HomeMap from')) {
    indexCode = "import HomeMap from '../../components/map/HomeMap';\n" + indexCode;
}
if (!indexCode.includes('useState } from')) {
    indexCode = indexCode.replace(/import \{ useMemo, useRef \} from 'react';/, "import { useMemo, useRef, useState } from 'react';");
}
fs.writeFileSync('src/app/(tabs)/index.tsx', indexCode);

// Fix HomeMap
let homeCode = fs.readFileSync('src/components/map/HomeMap.tsx', 'utf8');
homeCode = homeCode.replace(/(region: Region, details: \{ isGesture: boolean \})/, '(region: Region, details: { isGesture?: boolean })');
fs.writeFileSync('src/components/map/HomeMap.tsx', homeCode);
