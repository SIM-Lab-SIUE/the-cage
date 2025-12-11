import EquipmentCard from "@/components/EquipmentCard";

const equipmentList = [
  {
    name: "Canon XF100",    
    imageUrl: "../../../public/images/Canon XF100.jpg",
    category: "Video Camera",
    status: "Available",
  },
  {
    name: "Canon XF605",
    imageUrl: "../../../public/images/Canon XF605.jpg",
    category: "Video Camera",
    status: "Available",
  },
  {
    name: "Hollyland Solidcom C1",
    imageUrl: "../../../public/images/Hollyland Solidcom C1.jpg",
    category: "Intercom System",
    status: "Available",
  },
  {
    name: "Manfrotto 528XB",
    imageUrl: "../../../public/images/Manfrotto 528XB.jpg",
    category: "Tripod",
    status: "Available",
  },
  {
    name: "Manfrotto Compact Light",
    imageUrl: "../../../public/images/Manfrotto Compact Light.jpg",
    category: "Tripod",
    status: "Available",
  },
  {
    name: "Sennheiser ME66",
    imageUrl: "../../../public/images/Sennheiser ME66.jpg",
    category: "Microphone",
    status: "Available",
  },
  {
    name: "Yamaha QL1",
    imageUrl: "../../../public/images/Yamaha QL1.jpg",
    category: "Audio Console",
    status: "Available",
  },
  {
    name: "Zoom H5 Studio",
    imageUrl: "../../../public/images/Zoom H5studio.jpg",
    category: "Audio Recorder",
    status: "Available",
  },
  {
    name: "Zoom H6 Essential",
    imageUrl: "../../../public/images/Zoom H6essential.jpg",
    category: "Audio Recorder",
    status: "Available",
  },
  {
    name: "Zoom H6 Studio",
    imageUrl: "../../../public/images/Zoom H6studio.jpg",
    category: "Audio Recorder",
    status: "Available",
  }
];

export default function CatalogPage() {
  return (
    <main className="min-h-screen bg-gray-50 p-8">
      <h1 className="text-2xl font-bold mb-6 text-siue-red">Equipment Catalog</h1>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
        {equipmentList.map((item, idx) => (
          <EquipmentCard key={idx} {...item} />
        ))}
      </div>
    </main>                                  
  );
}