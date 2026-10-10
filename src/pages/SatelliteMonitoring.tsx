import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import {
  Satellite,
  Layers,
  Grid,
  Calendar,
  Play,
  Pause,
  Download,
  Maximize2,
  Minimize2,
  MapPin,
  AlertTriangle,
  CheckCircle2,
  TrendingUp,
  Droplets,
  Sun,
  Sparkles,
  Eye,
  Crosshair,
  ChevronRight,
  Split,
  Zap,
  Trash2,
  Activity,
  ShieldCheck,
  FileText
} from 'lucide-react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer
} from 'recharts';

// Types
export type SpectralLayer = 'ndvi' | 'ndwi' | 'ndre' | 'evi' | 'rgb' | 'vra';

interface FieldPreset {
  id: string;
  name: string;
  crop: string;
  location: string;
  areaHa: number;
  center: [number, number];
  zoom: number;
  coordinates: [number, number][]; // [lat, lng]
}

interface SatellitePass {
  date: string;
  label: string;
  satellite: string;
  cloudCover: number;
  meanNdvi: number;
  meanNdwi: number;
  meanNdre: number;
  meanEvi: number;
  vitalityScore: number;
  stage: string;
}

interface PixelCell {
  id: string;
  lat: number;
  lng: number;
  bounds: [[number, number], [number, number]];
  ndvi: number;
  ndwi: number;
  ndre: number;
  evi: number;
  nitrogenKg: number;
  waterStress: 'optimal' | 'adequate' | 'mild_stress' | 'stressed';
  status: 'lush' | 'good' | 'moderate' | 'low';
  prescription: string;
}

// Preset Farmlands
const PRESET_FIELDS: FieldPreset[] = [
  {
    id: 'sahyadri-01',
    name: 'Sahyadri Bio-Farms (Plot 4)',
    crop: 'Wheat & Gram Composite',
    location: 'Nanded, Maharashtra',
    areaHa: 14.5,
    center: [19.1432, 77.322],
    zoom: 16,
    coordinates: [
      [19.1465, 77.3185],
      [19.1462, 77.3255],
      [19.1402, 77.3258],
      [19.1398, 77.3182],
      [19.1465, 77.3185],
    ],
  },
  {
    id: 'nashik-vineyard',
    name: 'Nashik Valley Vineyard (Block 9)',
    crop: 'Export Table Grapes',
    location: 'Nashik, Maharashtra',
    areaHa: 8.2,
    center: [19.9982, 73.7915],
    zoom: 17,
    coordinates: [
      [20.0005, 73.7892],
      [20.0003, 73.7942],
      [19.9961, 73.7938],
      [19.9962, 73.7888],
      [20.0005, 73.7892],
    ],
  },
  {
    id: 'malwa-soybean',
    name: 'Malwa Agro-Basin (Sector 12)',
    crop: 'High-Protein Soybean',
    location: 'Indore, Madhya Pradesh',
    areaHa: 22.4,
    center: [22.7215, 75.8592],
    zoom: 16,
    coordinates: [
      [22.7252, 75.8545],
      [22.7248, 75.8642],
      [22.7178, 75.8638],
      [22.7182, 75.8542],
      [22.7252, 75.8545],
    ],
  },
  {
    id: 'punjab-corridor',
    name: 'Punjab Green Corridors (Field 7A)',
    crop: 'Basmati Rice (Pusa 1121)',
    location: 'Ludhiana, Punjab',
    areaHa: 18.8,
    center: [30.9032, 75.8595],
    zoom: 16,
    coordinates: [
      [30.9068, 75.8548],
      [30.9065, 75.8645],
      [30.8995, 75.8642],
      [30.8998, 75.8545],
      [30.9068, 75.8548],
    ],
  },
];

// Historical Sentinel-2 Passes
const SATELLITE_PASSES: SatellitePass[] = [
  {
    date: '2026-10-08',
    label: 'Oct 08 (Latest)',
    satellite: 'Sentinel-2B / MSI',
    cloudCover: 1.4,
    meanNdvi: 0.742,
    meanNdwi: 0.364,
    meanNdre: 0.435,
    meanEvi: 0.584,
    vitalityScore: 88,
    stage: 'Grain Filling & Canopy Maturation',
  },
  {
    date: '2026-10-03',
    label: 'Oct 03 (5d ago)',
    satellite: 'Sentinel-2A / MSI',
    cloudCover: 2.1,
    meanNdvi: 0.718,
    meanNdwi: 0.352,
    meanNdre: 0.418,
    meanEvi: 0.565,
    vitalityScore: 85,
    stage: 'Flowering & Peak Biomass',
  },
  {
    date: '2026-09-28',
    label: 'Sep 28 (10d ago)',
    satellite: 'Sentinel-2B / MSI',
    cloudCover: 0.8,
    meanNdvi: 0.674,
    meanNdwi: 0.338,
    meanNdre: 0.392,
    meanEvi: 0.528,
    vitalityScore: 81,
    stage: 'Heading & Reproductive Push',
  },
  {
    date: '2026-09-23',
    label: 'Sep 23 (15d ago)',
    satellite: 'Sentinel-2A / MSI',
    cloudCover: 12.0,
    meanNdvi: 0.621,
    meanNdwi: 0.315,
    meanNdre: 0.361,
    meanEvi: 0.485,
    vitalityScore: 76,
    stage: 'Late Tillering / Internode Extension',
  },
  {
    date: '2026-09-18',
    label: 'Sep 18 (20d ago)',
    satellite: 'Sentinel-2B / MSI',
    cloudCover: 4.2,
    meanNdvi: 0.578,
    meanNdwi: 0.288,
    meanNdre: 0.332,
    meanEvi: 0.442,
    vitalityScore: 71,
    stage: 'Active Tillering & Canopy Expansion',
  },
  {
    date: '2026-09-08',
    label: 'Sep 08 (30d ago)',
    satellite: 'Sentinel-2A / MSI',
    cloudCover: 8.5,
    meanNdvi: 0.492,
    meanNdwi: 0.245,
    meanNdre: 0.284,
    meanEvi: 0.375,
    vitalityScore: 63,
    stage: 'Early Vegetative Acceleration',
  },
  {
    date: '2026-08-24',
    label: 'Aug 24 (45d ago)',
    satellite: 'Sentinel-2B / MSI',
    cloudCover: 3.1,
    meanNdvi: 0.408,
    meanNdwi: 0.205,
    meanNdre: 0.235,
    meanEvi: 0.312,
    vitalityScore: 54,
    stage: 'Seedling Emergence & Stand Establishment',
  },
  {
    date: '2026-08-09',
    label: 'Aug 09 (60d ago)',
    satellite: 'Sentinel-2A / MSI',
    cloudCover: 6.0,
    meanNdvi: 0.318,
    meanNdwi: 0.162,
    meanNdre: 0.185,
    meanEvi: 0.245,
    vitalityScore: 42,
    stage: 'Pre-Planting Soil Prep & Sowing',
  },
];

// Helper: Point in polygon ray-casting
function isPointInPolygon(point: [number, number], polygon: [number, number][]): boolean {
  const [lat, lng] = point;
  let inside = false;
  for (let i = 0, j = polygon.length - 1; i < polygon.length; j = i++) {
    const [lati, lngi] = polygon[i];
    const [latj, lngj] = polygon[j];
    const intersect =
      lngi > lng !== lngj > lng &&
      lat < ((latj - lati) * (lng - lngi)) / (lngj - lngi) + lati;
    if (intersect) inside = !inside;
  }
  return inside;
}

// Helper: Polygon area calculation in hectares
function calculatePolygonAreaHa(points: [number, number][]): number {
  if (points.length < 3) return 0;
  let area = 0;
  for (let i = 0; i < points.length - 1; i++) {
    area += points[i][1] * points[i + 1][0] - points[i + 1][1] * points[i][0];
  }
  const avgLat = points.reduce((sum, p) => sum + p[0], 0) / points.length;
  return Number(
    Math.abs((area / 2) * 111320 ** 2 * Math.cos((avgLat * Math.PI) / 180) / 10000).toFixed(2)
  );
}

// Color lookup functions for Spectral Indices
function getNdviColor(val: number): string {
  if (val >= 0.75) return '#15803d'; // Deep Emerald (Peak vigor)
  if (val >= 0.65) return '#22c55e'; // Vibrant Green
  if (val >= 0.52) return '#84cc16'; // Lime / Moderate vigor
  if (val >= 0.4) return '#eab308'; // Amber / Early vegetative
  if (val >= 0.28) return '#f97316'; // Orange / Sparse canopy
  return '#dc2626'; // Red / Bare ground or severe stress
}

function getNdwiColor(val: number): string {
  if (val >= 0.4) return '#0369a1'; // Deep Ocean Blue (Water saturated)
  if (val >= 0.3) return '#0284c7'; // Rich Azure (Well hydrated)
  if (val >= 0.2) return '#38bdf8'; // Sky Blue (Adequate hydration)
  if (val >= 0.1) return '#7dd3fc'; // Pale Cyan (Mild moisture deficit)
  return '#fb923c'; // Dry soil / High water stress
}

function getNdreColor(val: number): string {
  if (val >= 0.45) return '#047857'; // High nitrogen & chlorophyll
  if (val >= 0.38) return '#10b981'; // Optimal
  if (val >= 0.28) return '#a3e635'; // Moderate
  if (val >= 0.2) return '#facc15'; // Low nitrogen warning
  return '#ef4444'; // Critical deficiency
}

function getEviColor(val: number): string {
  if (val >= 0.55) return '#065f46';
  if (val >= 0.45) return '#059669';
  if (val >= 0.35) return '#34d399';
  if (val >= 0.25) return '#fbbf24';
  return '#ea580c';
}

function getVraColor(ndvi: number): string {
  if (ndvi >= 0.68) return '#3b82f6'; // Zone 1: High Vigor (Maintenance rate: 50 kg N)
  if (ndvi >= 0.5) return '#eab308'; // Zone 2: Moderate Vigor (Target boost: 80 kg N)
  return '#ef4444'; // Zone 3: Stressed Zone (Remedial rate: 115 kg N)
}

export function SatelliteMonitoring() {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<L.Map | null>(null);
  const boundaryLayerRef = useRef<L.Polygon | null>(null);
  const gridLayerGroupRef = useRef<L.LayerGroup | null>(null);
  const drawingPolylineRef = useRef<L.Polyline | null>(null);

  // States
  const [selectedPresetId, setSelectedPresetId] = useState<string>('sahyadri-01');
  const [activeLayer, setActiveLayer] = useState<SpectralLayer>('ndvi');
  const [layerOpacity, setLayerOpacity] = useState<number>(0.85);
  const [pixelMatrixActive, setPixelMatrixActive] = useState<boolean>(true);
  const [splitCompareActive, setSplitCompareActive] = useState<boolean>(false);
  const [splitSliderPercent, setSplitSliderPercent] = useState<number>(50);
  const [currentPassIndex, setCurrentPassIndex] = useState<number>(0);
  const [isPlayingTimelapse, setIsPlayingTimelapse] = useState<boolean>(false);
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);

  // Interactive Boundary Drawing State
  const [isDrawingCustom, setIsDrawingCustom] = useState<boolean>(false);
  const [drawnPoints, setDrawnPoints] = useState<[number, number][]>([]);
  const [customBoundary, setCustomBoundary] = useState<[number, number][] | null>(null);

  // Pixel Inspector Selection
  const [selectedPixel, setSelectedPixel] = useState<PixelCell | null>(null);
  const [hoveredPixel, setHoveredPixel] = useState<PixelCell | null>(null);

  // Active Field Geometry
  const activePreset = useMemo(
    () => PRESET_FIELDS.find((p) => p.id === selectedPresetId) || PRESET_FIELDS[0],
    [selectedPresetId]
  );

  const activeCoordinates: [number, number][] = useMemo(() => {
    if (selectedPresetId === 'custom' && customBoundary && customBoundary.length >= 3) {
      return customBoundary;
    }
    return activePreset.coordinates;
  }, [selectedPresetId, customBoundary, activePreset]);

  const activePass = SATELLITE_PASSES[currentPassIndex];
  const fieldArea = useMemo(
    () =>
      selectedPresetId === 'custom' && customBoundary
        ? calculatePolygonAreaHa(customBoundary)
        : activePreset.areaHa,
    [selectedPresetId, customBoundary, activePreset]
  );

  // Generate 10m x 10m Pixel Farm grid cells within active coordinates
  const pixelGridCells: PixelCell[] = useMemo(() => {
    if (activeCoordinates.length < 3) return [];

    let minLat = Infinity,
      maxLat = -Infinity,
      minLng = Infinity,
      maxLng = -Infinity;

    activeCoordinates.forEach(([lat, lng]) => {
      if (lat < minLat) minLat = lat;
      if (lat > maxLat) maxLat = lat;
      if (lng < minLng) minLng = lng;
      if (lng > maxLng) maxLng = lng;
    });

    const stepLat = 0.00045; // ~10-15m
    const stepLng = 0.0005;

    const cells: PixelCell[] = [];
    let counter = 1;

    const passFactor = activePass.meanNdvi / 0.742;

    for (let lat = minLat; lat <= maxLat; lat += stepLat) {
      for (let lng = minLng; lng <= maxLng; lng += stepLng) {
        const centerLat = lat + stepLat / 2;
        const centerLng = lng + stepLng / 2;

        if (isPointInPolygon([centerLat, centerLng], activeCoordinates)) {
          // Deterministic organic spatial variation across the field
          const noise =
            Math.sin(lat * 1200) * 0.12 +
            Math.cos(lng * 1400) * 0.1 +
            Math.sin((lat + lng) * 2200) * 0.08;

          const rawNdvi = Math.min(
            0.92,
            Math.max(0.18, (activePass.meanNdvi + noise) * passFactor)
          );
          const rawNdwi = Math.min(
            0.55,
            Math.max(-0.1, (activePass.meanNdwi + noise * 0.6) * passFactor)
          );
          const rawNdre = Math.min(
            0.52,
            Math.max(0.15, (activePass.meanNdre + noise * 0.5) * passFactor)
          );
          const rawEvi = Math.min(
            0.7,
            Math.max(0.2, (activePass.meanEvi + noise * 0.8) * passFactor)
          );

          let status: PixelCell['status'] = 'good';
          let waterStress: PixelCell['waterStress'] = 'optimal';
          let prescription = 'Standard maintenance drip schedule';
          let nitrogenKg = 60;

          if (rawNdvi >= 0.72) {
            status = 'lush';
            nitrogenKg = 45;
            prescription = 'Optimal canopy vigor. No supplemental urea required.';
          } else if (rawNdvi >= 0.58) {
            status = 'good';
            nitrogenKg = 65;
            prescription = 'Healthy vegetative state. Maintain regular fertigation.';
          } else if (rawNdvi >= 0.42) {
            status = 'moderate';
            waterStress = 'mild_stress';
            nitrogenKg = 85;
            prescription = 'Sub-optimal vigor: Spot-treat with 20kg/ha Nitrogen foliar spray.';
          } else {
            status = 'low';
            waterStress = 'stressed';
            nitrogenKg = 110;
            prescription = 'High Stress Signal: Inspect localized drip line & apply bio-stimulant.';
          }

          cells.push({
            id: `PX-${String(counter++).padStart(3, '0')}`,
            lat: Number(centerLat.toFixed(5)),
            lng: Number(centerLng.toFixed(5)),
            bounds: [
              [lat, lng],
              [lat + stepLat, lng + stepLng],
            ],
            ndvi: Number(rawNdvi.toFixed(3)),
            ndwi: Number(rawNdwi.toFixed(3)),
            ndre: Number(rawNdre.toFixed(3)),
            evi: Number(rawEvi.toFixed(3)),
            nitrogenKg,
            waterStress,
            status,
            prescription,
          });
        }
      }
    }
    return cells;
  }, [activeCoordinates, activePass]);

  // Compute field health zone statistics
  const healthStats = useMemo(() => {
    if (!pixelGridCells.length) return { healthy: 64, moderate: 26, stressed: 10 };
    let healthyCount = 0;
    let modCount = 0;
    let stressCount = 0;

    pixelGridCells.forEach((c) => {
      if (c.ndvi >= 0.65) healthyCount++;
      else if (c.ndvi >= 0.48) modCount++;
      else stressCount++;
    });

    const total = pixelGridCells.length;
    return {
      healthy: Math.round((healthyCount / total) * 100),
      moderate: Math.round((modCount / total) * 100),
      stressed: Math.round((stressCount / total) * 100),
    };
  }, [pixelGridCells]);

  // Initialize Leaflet Map
  useEffect(() => {
    if (!mapContainerRef.current) return;

    if (!mapRef.current) {
      const mapInstance = L.map(mapContainerRef.current, {
        center: activePreset.center,
        zoom: activePreset.zoom,
        zoomControl: false,
        attributionControl: false,
      });

      // Esri High-Resolution World Imagery
      L.tileLayer(
        'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
        {
          maxZoom: 19,
          attribution: 'Esri, Maxar, Earthstar Geographics',
        }
      ).addTo(mapInstance);

      // CartoDB Reference Labels overlay for context
      L.tileLayer(
        'https://{s}.basemaps.cartocdn.com/rastertiles/voyager_only_labels/{z}/{x}/{y}{r}.png',
        {
          maxZoom: 19,
          opacity: 0.85,
        }
      ).addTo(mapInstance);

      L.control.zoom({ position: 'bottomright' }).addTo(mapInstance);

      gridLayerGroupRef.current = L.layerGroup().addTo(mapInstance);
      mapRef.current = mapInstance;
    }

    return () => {
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }
    };
  }, []);

  // Update Map Boundary & Zoom when Preset or Coordinates change
  useEffect(() => {
    const map = mapRef.current;
    if (!map || activeCoordinates.length < 3) return;

    if (boundaryLayerRef.current) {
      map.removeLayer(boundaryLayerRef.current);
      boundaryLayerRef.current = null;
    }

    const poly = L.polygon(activeCoordinates, {
      color: '#10b981',
      weight: 3,
      fillColor: activeLayer === 'rgb' ? 'transparent' : '#10b981',
      fillOpacity: activeLayer === 'rgb' ? 0 : 0.08,
      dashArray: isDrawingCustom ? '6 6' : undefined,
    }).addTo(map);

    boundaryLayerRef.current = poly;

    if (!isDrawingCustom) {
      map.fitBounds(poly.getBounds(), { padding: [40, 40], maxZoom: 18 });
    }
  }, [activeCoordinates, activeLayer, isDrawingCustom]);

  // Render Pixel Matrix Grid on Leaflet Map
  useEffect(() => {
    const group = gridLayerGroupRef.current;
    if (!group) return;

    group.clearLayers();

    if (!pixelMatrixActive || activeLayer === 'rgb' || isDrawingCustom) return;

    pixelGridCells.forEach((cell) => {
      let fillColor = '#10b981';
      if (activeLayer === 'ndvi') fillColor = getNdviColor(cell.ndvi);
      else if (activeLayer === 'ndwi') fillColor = getNdwiColor(cell.ndwi);
      else if (activeLayer === 'ndre') fillColor = getNdreColor(cell.ndre);
      else if (activeLayer === 'evi') fillColor = getEviColor(cell.evi);
      else if (activeLayer === 'vra') fillColor = getVraColor(cell.ndvi);

      const isSelected = selectedPixel?.id === cell.id;

      const rect = L.rectangle(cell.bounds, {
        color: isSelected ? '#38bdf8' : 'rgba(255,255,255,0.25)',
        weight: isSelected ? 2.5 : 0.8,
        fillColor,
        fillOpacity: layerOpacity,
      });

      rect.on('mouseover', () => {
        setHoveredPixel(cell);
        rect.setStyle({
          color: '#facc15',
          weight: 2,
          fillOpacity: Math.min(1, layerOpacity + 0.15),
        });
      });

      rect.on('mouseout', () => {
        setHoveredPixel(null);
        rect.setStyle({
          color: isSelected ? '#38bdf8' : 'rgba(255,255,255,0.25)',
          weight: isSelected ? 2.5 : 0.8,
          fillOpacity: layerOpacity,
        });
      });

      rect.on('click', () => {
        setSelectedPixel(cell);
      });

      group.addLayer(rect);
    });
  }, [pixelGridCells, activeLayer, layerOpacity, pixelMatrixActive, isDrawingCustom, selectedPixel]);

  // Drawing event listener for Custom Field Creation
  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;

    const handleMapClick = (e: L.LeafletMouseEvent) => {
      if (!isDrawingCustom) return;
      const pt: [number, number] = [e.latlng.lat, e.latlng.lng];
      setDrawnPoints((prev) => {
        const next = [...prev, pt];
        if (drawingPolylineRef.current) {
          drawingPolylineRef.current.setLatLngs(next);
        } else {
          drawingPolylineRef.current = L.polyline(next, {
            color: '#22c55e',
            weight: 3,
            dashArray: '5 5',
          }).addTo(map);
        }
        return next;
      });
    };

    map.on('click', handleMapClick);
    return () => {
      map.off('click', handleMapClick);
    };
  }, [isDrawingCustom]);

  // Handle Finish Boundary
  const handleFinishCustomDrawing = useCallback(() => {
    if (drawnPoints.length < 3) return;
    const closed: [number, number][] = [...drawnPoints, drawnPoints[0]];
    setCustomBoundary(closed);
    setSelectedPresetId('custom');
    setIsDrawingCustom(false);
    setDrawnPoints([]);

    if (drawingPolylineRef.current && mapRef.current) {
      mapRef.current.removeLayer(drawingPolylineRef.current);
      drawingPolylineRef.current = null;
    }
  }, [drawnPoints]);

  // Handle Cancel / Clear Drawing
  const handleClearDrawing = useCallback(() => {
    setIsDrawingCustom(false);
    setDrawnPoints([]);
    setCustomBoundary(null);
    setSelectedPresetId('sahyadri-01');

    if (drawingPolylineRef.current && mapRef.current) {
      mapRef.current.removeLayer(drawingPolylineRef.current);
      drawingPolylineRef.current = null;
    }
  }, []);

  // Time-lapse auto play effect
  useEffect(() => {
    let interval: any;
    if (isPlayingTimelapse) {
      interval = setInterval(() => {
        setCurrentPassIndex((prev) => (prev + 1) % SATELLITE_PASSES.length);
      }, 1600);
    }
    return () => clearInterval(interval);
  }, [isPlayingTimelapse]);

  // Quick export prescription handler
  const handleDownloadPrescription = () => {
    const prescriptionGeoJson = {
      type: 'FeatureCollection',
      metadata: {
        platform: 'PixelFarm Precision Earth Observation',
        field: activePreset.name,
        date: activePass.date,
        satellite: activePass.satellite,
        hectares: fieldArea,
        recommendation: 'Variable Rate Nitrogen & Moisture Prescriptions',
      },
      features: pixelGridCells.map((cell) => ({
        type: 'Feature',
        geometry: {
          type: 'Polygon',
          coordinates: [
            [
              [cell.bounds[0][1], cell.bounds[0][0]],
              [cell.bounds[1][1], cell.bounds[0][0]],
              [cell.bounds[1][1], cell.bounds[1][0]],
              [cell.bounds[0][1], cell.bounds[1][0]],
              [cell.bounds[0][1], cell.bounds[0][0]],
            ],
          ],
        },
        properties: {
          pixelId: cell.id,
          ndvi: cell.ndvi,
          waterStress: cell.waterStress,
          nitrogenKgHa: cell.nitrogenKg,
          prescription: cell.prescription,
        },
      })),
    };

    const blob = new Blob([JSON.stringify(prescriptionGeoJson, null, 2)], {
      type: 'application/json',
    });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `PixelFarm_Prescription_${activePreset.id}_${activePass.date}.geojson`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  // 120-Day Chart data derived from passes
  const chartTrendData = useMemo(() => {
    return [...SATELLITE_PASSES].reverse().map((p) => ({
      date: p.label.split(' ')[0],
      ndvi: p.meanNdvi,
      ndwi: p.meanNdwi,
      ndre: p.meanNdre,
    }));
  }, []);

  return (
    <div
      className={`h-full flex flex-col bg-zinc-950 text-zinc-100 overflow-hidden font-sans select-none ${
        isFullscreen ? 'fixed inset-0 z-50' : 'relative'
      }`}
    >
      {/* Top Banner: Pixel Farm Satellite HUD */}
      <header className="flex-shrink-0 bg-zinc-900/90 backdrop-blur-md border-b border-zinc-800 px-4 py-2.5 z-20 flex flex-wrap items-center justify-between gap-3 shadow-lg">
        <div className="flex items-center gap-3 min-w-0">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-700 flex items-center justify-center shadow-md shadow-emerald-950/60 border border-emerald-400/30">
            <Satellite className="w-5 h-5 text-white animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-base font-bold text-white tracking-tight flex items-center gap-1.5">
                Pixel Farm™ <span className="text-emerald-400 font-semibold text-xs px-2 py-0.5 rounded-full bg-emerald-950/80 border border-emerald-800/60">Satellite View</span>
              </h1>
              <span className="hidden sm:inline-flex items-center gap-1 text-[11px] font-medium text-emerald-300/90 bg-emerald-900/30 px-2 py-0.5 rounded-md border border-emerald-500/20">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping"></span>
                Sentinel-2B Active
              </span>
            </div>
            <p className="text-[11px] text-zinc-400 truncate max-w-md">
              10m Pixel Matrix · Multi-spectral Reflectance · Copernicus Earth Observation
            </p>
          </div>
        </div>

        {/* Telemetry Chips */}
        <div className="hidden lg:flex items-center gap-2 text-xs">
          <div className="bg-zinc-800/80 px-2.5 py-1 rounded-lg border border-zinc-700/60 flex items-center gap-1.5">
            <Sun className="w-3.5 h-3.5 text-amber-400" />
            <span className="text-zinc-400">Sun Zenith:</span>
            <span className="font-semibold text-zinc-200">32.4°</span>
          </div>
          <div className="bg-zinc-800/80 px-2.5 py-1 rounded-lg border border-zinc-700/60 flex items-center gap-1.5">
            <Droplets className="w-3.5 h-3.5 text-cyan-400" />
            <span className="text-zinc-400">Cloud Interference:</span>
            <span className="font-semibold text-emerald-400">{activePass.cloudCover}%</span>
          </div>
          <div className="bg-zinc-800/80 px-2.5 py-1 rounded-lg border border-zinc-700/60 flex items-center gap-1.5">
            <Crosshair className="w-3.5 h-3.5 text-emerald-400" />
            <span className="text-zinc-400">Ground GSD:</span>
            <span className="font-semibold text-zinc-200">10m / Pixel</span>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2 ml-auto sm:ml-0">
          <button
            onClick={() => setPixelMatrixActive((prev) => !prev)}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all ${
              pixelMatrixActive
                ? 'bg-emerald-600 text-white shadow-md shadow-emerald-900/50 border border-emerald-500/60'
                : 'bg-zinc-800 text-zinc-300 hover:bg-zinc-700 border border-zinc-700'
            }`}
            title="Toggle 10m x 10m Pixel Farm GIS matrix grid"
          >
            <Grid className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Pixel Matrix</span>
          </button>

          <button
            onClick={() => setSplitCompareActive((prev) => !prev)}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all ${
              splitCompareActive
                ? 'bg-blue-600 text-white shadow-md shadow-blue-900/50 border border-blue-500/60'
                : 'bg-zinc-800 text-zinc-300 hover:bg-zinc-700 border border-zinc-700'
            }`}
            title="Compare True Color Satellite vs NDVI"
          >
            <Split className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Split Compare</span>
          </button>

          <button
            onClick={handleDownloadPrescription}
            className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20 border border-emerald-500/30 flex items-center gap-1.5 transition-all"
            title="Export GeoJSON Prescription Map"
          >
            <Download className="w-3.5 h-3.5" />
            <span className="hidden md:inline">Prescription</span>
          </button>

          <button
            onClick={() => setIsFullscreen((prev) => !prev)}
            className="p-1.5 rounded-lg text-zinc-400 hover:text-white bg-zinc-800 hover:bg-zinc-700 border border-zinc-700 transition-all"
            title={isFullscreen ? 'Exit Fullscreen' : 'Fullscreen'}
          >
            {isFullscreen ? (
              <Minimize2 className="w-4 h-4" />
            ) : (
              <Maximize2 className="w-4 h-4" />
            )}
          </button>
        </div>
      </header>

      {/* Subheader: Field Selector & Spectral Toolbar */}
      <div className="flex-shrink-0 bg-zinc-900/60 border-b border-zinc-800/80 px-4 py-2 z-10 flex flex-wrap items-center justify-between gap-3 text-xs">
        {/* Preset Farm Selector */}
        <div className="flex items-center gap-2 overflow-x-auto scrollbar-none py-0.5">
          <span className="text-[11px] font-bold text-zinc-400 uppercase tracking-wider flex items-center gap-1">
            <MapPin className="w-3.5 h-3.5 text-emerald-400" />
            Field:
          </span>

          {PRESET_FIELDS.map((preset) => (
            <button
              key={preset.id}
              onClick={() => {
                setSelectedPresetId(preset.id);
                setIsDrawingCustom(false);
              }}
              className={`px-3 py-1.5 rounded-lg font-medium whitespace-nowrap transition-all ${
                selectedPresetId === preset.id && !isDrawingCustom
                  ? 'bg-zinc-100 text-zinc-950 font-semibold shadow-xs'
                  : 'bg-zinc-800/70 text-zinc-300 hover:bg-zinc-800 hover:text-white border border-zinc-700/50'
              }`}
            >
              {preset.name.split(' (')[0]}
              <span className="ml-1.5 text-[10px] opacity-75 font-normal">
                {preset.areaHa} ha
              </span>
            </button>
          ))}

          {/* Custom Field Button */}
          {isDrawingCustom ? (
            <div className="flex items-center gap-1.5">
              <button
                onClick={handleFinishCustomDrawing}
                disabled={drawnPoints.length < 3}
                className="px-3 py-1.5 rounded-lg font-bold bg-emerald-600 text-white disabled:opacity-50 hover:bg-emerald-500 shadow-xs"
              >
                Finish ({drawnPoints.length} pts)
              </button>
              <button
                onClick={handleClearDrawing}
                className="p-1.5 rounded-lg bg-zinc-800 hover:bg-red-950 text-zinc-400 hover:text-red-400 border border-zinc-700"
                title="Cancel Drawing"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
          ) : (
            <button
              onClick={() => {
                setIsDrawingCustom(true);
                setDrawnPoints([]);
              }}
              className="px-3 py-1.5 rounded-lg font-medium bg-zinc-800/70 text-zinc-300 hover:bg-zinc-800 hover:text-white border border-zinc-700/50 flex items-center gap-1"
            >
              <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
              Draw Boundary
            </button>
          )}
        </div>

        {/* Spectral Layer Selector */}
        <div className="flex items-center gap-1.5 overflow-x-auto scrollbar-none py-0.5 ml-auto">
          <span className="text-[11px] font-bold text-zinc-400 uppercase tracking-wider flex items-center gap-1">
            <Layers className="w-3.5 h-3.5 text-cyan-400" />
            Layer:
          </span>

          {(
            [
              { key: 'ndvi', label: 'NDVI (Vigor)', desc: 'Vegetation Health Index' },
              { key: 'ndwi', label: 'NDWI (Water)', desc: 'Canopy Moisture Content' },
              { key: 'ndre', label: 'NDRE (Nitrogen)', desc: 'Red-Edge Chlorophyll' },
              { key: 'evi', label: 'EVI (Biomass)', desc: 'Enhanced Biomass Index' },
              { key: 'vra', label: 'VRA Zones', desc: 'Precision Prescription Zones' },
              { key: 'rgb', label: 'True Color', desc: 'High-Res Esri Satellite' },
            ] as const
          ).map((layer) => (
            <button
              key={layer.key}
              onClick={() => setActiveLayer(layer.key)}
              title={layer.desc}
              className={`px-2.5 py-1 rounded-md text-xs font-medium transition-all ${
                activeLayer === layer.key
                  ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/50 shadow-xs'
                  : 'bg-zinc-800/50 text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/80 border border-transparent'
              }`}
            >
              {layer.label}
            </button>
          ))}
        </div>
      </div>

      {/* Main Workspace: Left Map & Right Analytics Dashboard */}
      <div className="flex-1 flex flex-col lg:flex-row min-h-0 relative">
        {/* MAP CONTAINER */}
        <div className="flex-1 relative min-h-[380px] lg:min-h-0 bg-zinc-950 overflow-hidden">
          {/* Leaflet Map Div */}
          <div ref={mapContainerRef} className="w-full h-full" />

          {/* Drawing Guidance Banner */}
          {isDrawingCustom && (
            <div className="absolute top-4 left-1/2 -translate-x-1/2 z-[400] bg-zinc-900/95 border border-emerald-500/50 shadow-2xl rounded-xl px-4 py-2.5 text-xs text-zinc-200 flex items-center gap-3 backdrop-blur-md">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-ping"></span>
              <span>
                Click corners of your farm to draw boundary ({drawnPoints.length} corners placed).
              </span>
              <button
                onClick={handleFinishCustomDrawing}
                disabled={drawnPoints.length < 3}
                className="px-2.5 py-1 bg-emerald-600 text-white rounded font-bold hover:bg-emerald-500 disabled:opacity-40"
              >
                Complete Field
              </button>
            </div>
          )}

          {/* Interactive Split Comparison Slider Overlay */}
          {splitCompareActive && (
            <div className="absolute inset-0 z-[400] pointer-events-none flex items-stretch">
              <div
                style={{ width: `${splitSliderPercent}%` }}
                className="h-full border-r-2 border-emerald-400 shadow-2xl bg-emerald-500/5 relative"
              >
                <div className="absolute top-4 left-4 bg-zinc-900/90 text-white text-[11px] font-bold px-2.5 py-1 rounded-md border border-zinc-700 pointer-events-auto backdrop-blur-md shadow-lg">
                  Natural Satellite RGB
                </div>
              </div>
              <div className="flex-1 h-full bg-emerald-950/5 relative">
                <div className="absolute top-4 right-4 bg-emerald-900/90 text-emerald-200 text-[11px] font-bold px-2.5 py-1 rounded-md border border-emerald-600/50 pointer-events-auto backdrop-blur-md shadow-lg">
                  {activeLayer.toUpperCase()} Multispectral Analysis
                </div>
              </div>

              {/* Draggable Divider Handle */}
              <div
                style={{ left: `${splitSliderPercent}%` }}
                className="absolute top-0 bottom-0 -ml-4 w-8 flex items-center justify-center pointer-events-auto cursor-ew-resize group"
              >
                <input
                  type="range"
                  min="5"
                  max="95"
                  value={splitSliderPercent}
                  onChange={(e) => setSplitSliderPercent(Number(e.target.value))}
                  className="absolute inset-0 opacity-0 cursor-ew-resize w-full h-full z-10"
                />
                <div className="w-7 h-7 rounded-full bg-emerald-500 text-zinc-950 font-bold flex items-center justify-center shadow-xl border-2 border-white group-hover:scale-110 transition-transform">
                  ↔
                </div>
              </div>
            </div>
          )}

          {/* Floating Map HUD: Active Layer Color Legend & Opacity Slider */}
          <div className="absolute bottom-6 left-4 z-[400] bg-zinc-900/90 backdrop-blur-md border border-zinc-800 rounded-xl p-3 shadow-2xl max-w-xs text-xs space-y-2 pointer-events-auto">
            <div className="flex items-center justify-between text-[11px] font-bold text-zinc-300">
              <span className="uppercase tracking-wider flex items-center gap-1.5">
                <span
                  className="w-2.5 h-2.5 rounded-full"
                  style={{
                    backgroundColor:
                      activeLayer === 'ndvi'
                        ? '#22c55e'
                        : activeLayer === 'ndwi'
                        ? '#0284c7'
                        : activeLayer === 'ndre'
                        ? '#10b981'
                        : activeLayer === 'vra'
                        ? '#3b82f6'
                        : '#eab308',
                  }}
                ></span>
                {activeLayer.toUpperCase()} Spectral Gradient
              </span>
              <span className="text-zinc-500 font-mono">
                {activeLayer === 'ndvi'
                  ? '0.1 → 0.9'
                  : activeLayer === 'ndwi'
                  ? '-0.2 → 0.5'
                  : 'Relative'}
              </span>
            </div>

            {/* Visual Color Ramp Bar */}
            <div className="h-3 w-full rounded-md overflow-hidden relative shadow-inner">
              {activeLayer === 'ndvi' && (
                <div className="w-full h-full bg-gradient-to-r from-red-600 via-yellow-400 to-emerald-600" />
              )}
              {activeLayer === 'ndwi' && (
                <div className="w-full h-full bg-gradient-to-r from-amber-500 via-sky-300 to-sky-700" />
              )}
              {activeLayer === 'ndre' && (
                <div className="w-full h-full bg-gradient-to-r from-red-500 via-lime-400 to-emerald-700" />
              )}
              {activeLayer === 'evi' && (
                <div className="w-full h-full bg-gradient-to-r from-orange-600 via-emerald-400 to-emerald-800" />
              )}
              {activeLayer === 'vra' && (
                <div className="w-full h-full bg-gradient-to-r from-red-500 via-yellow-400 to-blue-600" />
              )}
              {activeLayer === 'rgb' && (
                <div className="w-full h-full bg-gradient-to-r from-stone-600 to-stone-400" />
              )}
            </div>

            <div className="flex justify-between text-[10px] text-zinc-400 font-mono">
              <span>{activeLayer === 'vra' ? 'Zone 3 (Stress)' : 'Low / Stressed'}</span>
              <span>{activeLayer === 'vra' ? 'Zone 2 (Moderate)' : 'Moderate'}</span>
              <span>{activeLayer === 'vra' ? 'Zone 1 (Vigorous)' : 'Lush Canopy'}</span>
            </div>

            {/* Opacity slider */}
            <div className="pt-1.5 border-t border-zinc-800/80 flex items-center justify-between text-[11px]">
              <span className="text-zinc-400 flex items-center gap-1">
                <Eye className="w-3 h-3 text-zinc-500" />
                Overlay Opacity:
              </span>
              <div className="flex items-center gap-2">
                <input
                  type="range"
                  min="20"
                  max="100"
                  value={Math.round(layerOpacity * 100)}
                  onChange={(e) => setLayerOpacity(Number(e.target.value) / 100)}
                  className="w-16 accent-emerald-500 cursor-pointer"
                />
                <span className="font-mono text-zinc-300 w-8 text-right">
                  {Math.round(layerOpacity * 100)}%
                </span>
              </div>
            </div>
          </div>

          {/* Floating Hover/Selected Pixel Telemetry Pill */}
          {(hoveredPixel || selectedPixel) && (
            <div className="absolute top-4 left-4 z-[400] bg-zinc-900/95 backdrop-blur-md border border-zinc-700/80 rounded-xl p-3 shadow-2xl text-xs space-y-1.5 min-w-[240px] pointer-events-auto animate-in fade-in">
              <div className="flex items-center justify-between border-b border-zinc-800 pb-1.5">
                <span className="font-bold text-white flex items-center gap-1.5">
                  <Grid className="w-3.5 h-3.5 text-emerald-400" />
                  {(hoveredPixel || selectedPixel)?.id}
                </span>
                <span
                  className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase ${
                    (hoveredPixel || selectedPixel)?.status === 'lush'
                      ? 'bg-emerald-950 text-emerald-400 border border-emerald-800'
                      : (hoveredPixel || selectedPixel)?.status === 'good'
                      ? 'bg-lime-950 text-lime-400 border border-lime-800'
                      : (hoveredPixel || selectedPixel)?.status === 'moderate'
                      ? 'bg-amber-950 text-amber-400 border border-amber-800'
                      : 'bg-red-950 text-red-400 border border-red-800'
                  }`}
                >
                  {(hoveredPixel || selectedPixel)?.status}
                </span>
              </div>
              <div className="grid grid-cols-2 gap-2 text-[11px] pt-1">
                <div>
                  <span className="text-zinc-500 block">NDVI Index:</span>
                  <span className="font-mono font-bold text-emerald-400">
                    {(hoveredPixel || selectedPixel)?.ndvi}
                  </span>
                </div>
                <div>
                  <span className="text-zinc-500 block">NDWI Water:</span>
                  <span className="font-mono font-bold text-sky-400">
                    {(hoveredPixel || selectedPixel)?.ndwi}
                  </span>
                </div>
                <div>
                  <span className="text-zinc-500 block">Coordinates:</span>
                  <span className="font-mono text-zinc-300 text-[10px]">
                    {(hoveredPixel || selectedPixel)?.lat.toFixed(4)}°N,{' '}
                    {(hoveredPixel || selectedPixel)?.lng.toFixed(4)}°E
                  </span>
                </div>
                <div>
                  <span className="text-zinc-500 block">Nitrogen Rate:</span>
                  <span className="font-mono font-bold text-amber-300">
                    {(hoveredPixel || selectedPixel)?.nitrogenKg} kg/ha
                  </span>
                </div>
              </div>
              <p className="text-[10px] text-zinc-300 italic pt-1 border-t border-zinc-800/80">
                {(hoveredPixel || selectedPixel)?.prescription}
              </p>
            </div>
          )}
        </div>

        {/* RIGHT ANALYTICS SIDEBAR */}
        <aside className="w-full lg:w-[380px] xl:w-[420px] flex-shrink-0 bg-zinc-900 border-t lg:border-t-0 lg:border-l border-zinc-800 flex flex-col h-full overflow-y-auto scrollbar-thin">
          <div className="p-4 space-y-4">
            {/* Field Overview Header Card */}
            <div className="rounded-xl border border-zinc-800 bg-zinc-950/60 p-4 relative overflow-hidden shadow-sm">
              <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/5 rounded-full blur-2xl pointer-events-none" />
              <div className="flex items-start justify-between">
                <div>
                  <h2 className="text-sm font-bold text-white tracking-tight">
                    {selectedPresetId === 'custom' ? 'Custom Farmland' : activePreset.name}
                  </h2>
                  <p className="text-xs text-zinc-400 mt-0.5">
                    {selectedPresetId === 'custom'
                      ? 'User-Drawn Boundary'
                      : `${activePreset.crop} · ${activePreset.location}`}
                  </p>
                </div>
                <div className="text-right">
                  <span className="text-lg font-black text-emerald-400 font-mono">
                    {fieldArea} ha
                  </span>
                  <span className="block text-[10px] text-zinc-500">
                    {(fieldArea * 2.471).toFixed(1)} Acres
                  </span>
                </div>
              </div>

              {/* Vitality Score Gauge */}
              <div className="mt-3 pt-3 border-t border-zinc-800/80 flex items-center justify-between">
                <div>
                  <div className="flex items-center gap-1.5">
                    <Activity className="w-4 h-4 text-emerald-400" />
                    <span className="text-xs font-semibold text-zinc-200">Field Vitality Score</span>
                  </div>
                  <p className="text-[10px] text-zinc-400 mt-0.5">{activePass.stage}</p>
                </div>
                <div className="flex items-baseline gap-1">
                  <span className="text-2xl font-black text-emerald-400 font-mono">
                    {activePass.vitalityScore}
                  </span>
                  <span className="text-xs text-zinc-500 font-mono">/100</span>
                </div>
              </div>
            </div>

            {/* 4 Core Metrics Grid */}
            <div className="grid grid-cols-2 gap-2.5">
              <div className="rounded-xl border border-zinc-800 bg-zinc-950/40 p-3 hover:border-emerald-500/40 transition-colors">
                <div className="flex items-center justify-between text-zinc-400 text-[11px]">
                  <span>Mean NDVI</span>
                  <TrendingUp className="w-3.5 h-3.5 text-emerald-400" />
                </div>
                <div className="mt-1 flex items-baseline justify-between">
                  <span className="text-xl font-bold font-mono text-emerald-400">
                    {activePass.meanNdvi.toFixed(3)}
                  </span>
                  <span className="text-[10px] text-emerald-500 font-semibold bg-emerald-950/80 px-1.5 py-0.5 rounded">
                    +4.2%
                  </span>
                </div>
                <span className="text-[10px] text-zinc-500 block mt-1">High Photosynthetic Vigor</span>
              </div>

              <div className="rounded-xl border border-zinc-800 bg-zinc-950/40 p-3 hover:border-sky-500/40 transition-colors">
                <div className="flex items-center justify-between text-zinc-400 text-[11px]">
                  <span>Mean NDWI (Water)</span>
                  <Droplets className="w-3.5 h-3.5 text-sky-400" />
                </div>
                <div className="mt-1 flex items-baseline justify-between">
                  <span className="text-xl font-bold font-mono text-sky-400">
                    {activePass.meanNdwi.toFixed(3)}
                  </span>
                  <span className="text-[10px] text-sky-400 font-semibold bg-sky-950/80 px-1.5 py-0.5 rounded">
                    Adequate
                  </span>
                </div>
                <span className="text-[10px] text-zinc-500 block mt-1">Zero Leaf Dehydration</span>
              </div>

              <div className="rounded-xl border border-zinc-800 bg-zinc-950/40 p-3 hover:border-emerald-500/40 transition-colors">
                <div className="flex items-center justify-between text-zinc-400 text-[11px]">
                  <span>Chlorophyll NDRE</span>
                  <Sparkles className="w-3.5 h-3.5 text-teal-400" />
                </div>
                <div className="mt-1 flex items-baseline justify-between">
                  <span className="text-xl font-bold font-mono text-teal-400">
                    {activePass.meanNdre.toFixed(3)}
                  </span>
                  <span className="text-[10px] text-teal-400 font-semibold bg-teal-950/80 px-1.5 py-0.5 rounded">
                    Optimal
                  </span>
                </div>
                <span className="text-[10px] text-zinc-500 block mt-1">Nitrogen Uptake Active</span>
              </div>

              <div className="rounded-xl border border-zinc-800 bg-zinc-950/40 p-3 hover:border-amber-500/40 transition-colors">
                <div className="flex items-center justify-between text-zinc-400 text-[11px]">
                  <span>Biomass (EVI)</span>
                  <Zap className="w-3.5 h-3.5 text-amber-400" />
                </div>
                <div className="mt-1 flex items-baseline justify-between">
                  <span className="text-xl font-bold font-mono text-amber-400">
                    {activePass.meanEvi.toFixed(3)}
                  </span>
                  <span className="text-[10px] text-amber-400 font-semibold bg-amber-950/80 px-1.5 py-0.5 rounded">
                    4.2 t/ha
                  </span>
                </div>
                <span className="text-[10px] text-zinc-500 block mt-1">Dense Foliar Density</span>
              </div>
            </div>

            {/* Health Zones Breakdown */}
            <div className="rounded-xl border border-zinc-800 bg-zinc-950/40 p-3.5 space-y-2.5">
              <div className="flex items-center justify-between text-xs">
                <span className="font-bold text-zinc-200">Management Zones (VRA)</span>
                <span className="text-[10px] text-zinc-400">10m Ground Sample</span>
              </div>

              {/* Progress bar */}
              <div className="h-2.5 w-full bg-zinc-800 rounded-full overflow-hidden flex shadow-inner">
                <div
                  style={{ width: `${healthStats.healthy}%` }}
                  className="h-full bg-emerald-500 transition-all duration-500"
                  title={`Healthy: ${healthStats.healthy}%`}
                />
                <div
                  style={{ width: `${healthStats.moderate}%` }}
                  className="h-full bg-amber-400 transition-all duration-500"
                  title={`Moderate: ${healthStats.moderate}%`}
                />
                <div
                  style={{ width: `${healthStats.stressed}%` }}
                  className="h-full bg-red-500 transition-all duration-500"
                  title={`Stressed: ${healthStats.stressed}%`}
                />
              </div>

              <div className="grid grid-cols-3 gap-1 text-[10px] font-medium pt-1">
                <div className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-emerald-500" />
                  <span className="text-zinc-400">Zone 1:</span>
                  <span className="font-bold text-emerald-400 font-mono">
                    {healthStats.healthy}%
                  </span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-amber-400" />
                  <span className="text-zinc-400">Zone 2:</span>
                  <span className="font-bold text-amber-400 font-mono">
                    {healthStats.moderate}%
                  </span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-red-500" />
                  <span className="text-zinc-400">Zone 3:</span>
                  <span className="font-bold text-red-400 font-mono">
                    {healthStats.stressed}%
                  </span>
                </div>
              </div>
            </div>

            {/* 120-Day NDVI Historical Curve Chart */}
            <div className="rounded-xl border border-zinc-800 bg-zinc-950/40 p-3.5 space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="font-bold text-zinc-200">120-Day NDVI Evolution Curve</span>
                <span className="text-[10px] text-emerald-400 font-mono">Sentinel-2 Harmonized</span>
              </div>
              <div className="h-36 w-full -ml-3">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={chartTrendData}>
                    <defs>
                      <linearGradient id="ndviGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#10b981" stopOpacity={0.6} />
                        <stop offset="95%" stopColor="#10b981" stopOpacity={0.0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#27272a" />
                    <XAxis dataKey="date" stroke="#71717a" fontSize={10} tickLine={false} />
                    <YAxis
                      domain={[0.2, 0.9]}
                      stroke="#71717a"
                      fontSize={10}
                      tickLine={false}
                      width={30}
                    />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: '#18181b',
                        border: '1px solid #3f3f46',
                        borderRadius: '8px',
                        fontSize: '11px',
                        color: '#f4f4f5',
                      }}
                    />
                    <Area
                      type="monotone"
                      dataKey="ndvi"
                      stroke="#10b981"
                      strokeWidth={2}
                      fillOpacity={1}
                      fill="url(#ndviGradient)"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* AI Field Agronomist Insights */}
            <div className="rounded-xl border border-emerald-900/60 bg-emerald-950/20 p-3.5 space-y-2">
              <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-400">
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
                <span>AI Agronomist Satellite Advisory</span>
              </div>
              <ul className="text-[11px] text-zinc-300 space-y-1.5 pl-3 list-disc marker:text-emerald-500">
                <li>
                  Canopy growth shows consistent acceleration (+4.2% NDVI vs previous pass); biomass
                  accumulation is tracking 12% above seasonal average.
                </li>
                <li>
                  Sector East contains 4 micro-pixels (Zone 3) with mild water stress; verify drip line
                  pressure at lateral junctions.
                </li>
                <li>
                  Variable Rate Prescription will reduce total nitrogen input by an estimated 18.5%
                  while preventing vegetative lodging.
                </li>
              </ul>
            </div>
          </div>
        </aside>
      </div>

      {/* BOTTOM HISTORICAL PASS SCRUBBER & TIMELAPSE CONTROLS */}
      <footer className="flex-shrink-0 bg-zinc-900/95 border-t border-zinc-800 px-4 py-2.5 z-20 flex flex-wrap items-center justify-between gap-3 text-xs shadow-xl">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsPlayingTimelapse((prev) => !prev)}
            className={`px-3 py-1.5 rounded-lg font-bold flex items-center gap-1.5 transition-all ${
              isPlayingTimelapse
                ? 'bg-amber-600 text-white shadow-md shadow-amber-950'
                : 'bg-emerald-600 text-white hover:bg-emerald-500 shadow-md shadow-emerald-950'
            }`}
          >
            {isPlayingTimelapse ? (
              <>
                <Pause className="w-3.5 h-3.5" />
                <span>Pause</span>
              </>
            ) : (
              <>
                <Play className="w-3.5 h-3.5" />
                <span>Play Time-Lapse</span>
              </>
            )}
          </button>
          <span className="text-[11px] text-zinc-400 font-mono hidden sm:inline">
            Pass {currentPassIndex + 1} of {SATELLITE_PASSES.length}
          </span>
        </div>

        {/* Date Timeline Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto scrollbar-none py-1 flex-1 max-w-2xl justify-start sm:justify-center">
          {SATELLITE_PASSES.map((pass, index) => (
            <button
              key={pass.date}
              onClick={() => {
                setCurrentPassIndex(index);
                setIsPlayingTimelapse(false);
              }}
              className={`px-2.5 py-1 rounded-md text-[11px] font-medium whitespace-nowrap transition-all ${
                currentPassIndex === index
                  ? 'bg-emerald-500 text-zinc-950 font-bold shadow-md'
                  : 'bg-zinc-800/80 text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800'
              }`}
            >
              {pass.label.split(' ')[0]}
            </button>
          ))}
        </div>

        {/* Current Active Date & Status */}
        <div className="flex items-center gap-2 text-right">
          <Calendar className="w-3.5 h-3.5 text-zinc-400" />
          <span className="font-mono text-zinc-200 font-semibold">{activePass.date}</span>
          <span className="text-[10px] text-emerald-400 bg-emerald-950 px-2 py-0.5 rounded border border-emerald-800 font-mono">
            NDVI: {activePass.meanNdvi}
          </span>
        </div>
      </footer>
    </div>
  );
}
