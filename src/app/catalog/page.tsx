import EquipmentCard from "@/components/EquipmentCard";

type EquipmentItem = {
  name: string;
  imageUrl: string;
  category: string;
  status: 'Available' | 'Unavailable';
};

const equipmentList: EquipmentItem[] = [
  {
    name: "Canon XF100",    
    imageUrl: "/images/Canon XF100.jpg",
    category: "Video Camera",
    status: "Available",
  },
  {
    name: "Canon XF605",
    imageUrl: "/images/Canon XF605.jpg",
    category: "Video Camera",
    status: "Available",
  },
  {
    name: "Hollyland Solidcom C1",
    imageUrl: "/images/Hollyland Solidcom C1.jpg",
    category: "Intercom System",
    status: "Available",
  },
  {
    name: "Manfrotto 528XB",
    imageUrl: "/images/Manfrotto 528XB.jpg",
    category: "Tripod",
    status: "Available",
  },
  {
    name: "Manfrotto Compact Light",
    imageUrl: "/images/Manfrotto Compact Light.jpg",
    category: "Tripod",
    status: "Available",
  },
  {
    name: "Sennheiser ME66",
    imageUrl: "/images/Sennheiser ME66.jpg",
    category: "Microphone",
    status: "Available",
  },
  {
    name: "Yamaha QL1",
    imageUrl: "/images/Yamaha QL1.jpg",
    category: "Audio Console",
    status: "Available",
  },
  {
    name: "Zoom H5 Studio",
    imageUrl: "/images/Zoom H5studio.jpg",
    category: "Audio Recorder",
    status: "Available",
  },
  {
    name: "Zoom H6 Essential",
    imageUrl: "/images/Zoom H6essential.jpg",
    category: "Audio Recorder",
    status: "Available",
  },
  {
    name: "Zoom H6 Studio",
    imageUrl: "/images/Zoom H6studio.jpg",
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