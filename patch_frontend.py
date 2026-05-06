import sys

def patch_features_panel():
    with open('frontend/src/components/molecules/FeaturesPanel.jsx', 'r', encoding='utf-8') as f:
        content = f.read()

    new_toggle_item = """  const toggleItem = (label) => {
    setSelectedItems(prev => {
      const next = prev.includes(label)
        ? prev.filter(item => item !== label)
        : [...prev, label];
        
      if (title === 'Layers' && typeof window.onLayerToggleGlobal === 'function') {
        window.onLayerToggleGlobal(next);
      }
      return next;
    });
  };"""
    
    old_toggle_item = """  const toggleItem = (label) => {
    setSelectedItems(prev =>
      prev.includes(label)
        ? prev.filter(item => item !== label)
        : [...prev, label]
    );
  };"""
    content = content.replace(old_toggle_item, new_toggle_item)

    with open('frontend/src/components/molecules/FeaturesPanel.jsx', 'w', encoding='utf-8') as f:
        f.write(content)

def patch_map_canvas():
    with open('frontend/src/components/organisms/MapCanvas.jsx', 'r', encoding='utf-8') as f:
        content = f.read()
        
    if "import { Data }" not in content:
        content = content.replace(
            "import { GoogleMap, useJsApiLoader, OverlayView } from '@react-google-maps/api';",
            "import { GoogleMap, useJsApiLoader, OverlayView, Data } from '@react-google-maps/api';"
        )
        
    if "hazardData" not in content:
        content = content.replace(
            "export const MapCanvas = ({",
            "export const MapCanvas = ({\\n  hazardData,\\n  trafficData,"
        )
        
        data_components = """      {hazardData && (
        <Data
          options={{ fillColor: "red", strokeColor: "red", strokeWeight: 2, fillOpacity: 0.3 }}
          onLoad={data => data.addGeoJson(hazardData)}
        />
      )}
      {trafficData && (
        <Data
          options={{ fillColor: "orange", strokeColor: "orange", strokeWeight: 3, fillOpacity: 0.5 }}
          onLoad={data => data.addGeoJson(trafficData)}
        />
      )}"""
        content = content.replace(
            "{/* Existing markers */}",
            data_components + "\\n\\n      {/* Existing markers */}"
        )
        
    with open('frontend/src/components/organisms/MapCanvas.jsx', 'w', encoding='utf-8') as f:
        f.write(content)

def patch_site_selection_home():
    with open('frontend/src/pages/SiteSelectionHome.jsx', 'r', encoding='utf-8') as f:
        content = f.read()

    if "useBackendAPI" not in content:
        content = content.replace(
            "import { SidePanel } from '../components/organisms/SidePanel';",
            "import { SidePanel } from '../components/organisms/SidePanel';\\nimport { useBackendAPI } from '../hooks/useBackendAPI';"
        )
        
        new_state = """const [geminiMarker, setGeminiMarker] = useState(null);
  const [hazardData, setHazardData] = useState(null);
  const [trafficData, setTrafficData] = useState(null);
  const { generateRecommendation, getHazards, getTraffic } = useBackendAPI();

  useEffect(() => {
    window.onLayerToggleGlobal = async (layers) => {
      const bounds = { xmin: 123.8, ymin: 10.2, xmax: 124.0, ymax: 10.4 };
      if (layers.includes('Flood Hazard') || layers.includes('Earthquake Risk')) {
        const data = await getHazards(bounds);
        setHazardData(data);
      } else {
        setHazardData(null);
      }
      if (layers.includes('Traffic Layer')) {
        const data = await getTraffic(bounds);
        setTrafficData(data);
      } else {
        setTrafficData(null);
      }
    };
    return () => { delete window.onLayerToggleGlobal; };
  }, [getHazards, getTraffic]);"""
  
        content = content.replace(
            "const [geminiMarker, setGeminiMarker] = useState(null);",
            new_state
        )
        
        content = content.replace(
            "const handleMarkerPlaced = (coords) => {",
            "const handleMarkerPlaced = async (coords) => {\\n    try { await generateRecommendation(coords.lat, coords.lng, 'New Site'); } catch(e) {}"
        )
        
        content = content.replace(
            "geminiMarker={geminiMarker}",
            "geminiMarker={geminiMarker}\\n      hazardData={hazardData}\\n      trafficData={trafficData}"
        )
        
    with open('frontend/src/pages/SiteSelectionHome.jsx', 'w', encoding='utf-8') as f:
        f.write(content)

try:
    patch_features_panel()
    patch_map_canvas()
    patch_site_selection_home()
    print("Frontend patches applied.")
except Exception as e:
    print(f"Error: {e}")
