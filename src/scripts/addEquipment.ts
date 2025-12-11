import snipeITClient from "../services/snipeit";

const equipmentList = [
  { name: "Canon XF100", category: "Video Camera" },
  { name: "Canon XF605", category: "Video Camera" },
  { name: "Hollyland Solidcom C1", category: "Intercom System" },
  { name: "Manfrotto 528XB", category: "Tripod" },
  { name: "Manfrotto Compact Light", category: "Tripod" },
  { name: "Sennheiser ME66", category: "Microphone" },
  { name: "Yamaha QL1", category: "Audio Console" },
  { name: "Zoom H5 Studio", category: "Audio Recorder" },
  { name: "Zoom H6 Essential", category: "Audio Recorder" },
  { name: "Zoom H6 Studio", category: "Audio Recorder" },
];

async function addEquipmentToSnipeIT() {
  for (const equipment of equipmentList) {
    try {
      const response = await snipeITClient.request("/hardware", {
        method: "POST",
        body: JSON.stringify({
          name: equipment.name,
          category: equipment.category,
          status: "Available",
        }),
      });
      console.log(`Added: ${equipment.name}`, response);
    } catch (error) {
      console.error(`Failed to add: ${equipment.name}`, error);
    }
  }
}

addEquipmentToSnipeIT();