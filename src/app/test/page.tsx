import Accordion from "@/component/accordion/accordion";
import ContactMap from "@/component/contact-map/contact-map";

// Sandbox route for trying components in isolation.
const ACCORDION_ITEMS = [
  {
    value: "details",
    label: "รายละเอียดสินค้า",
    content: "รายละเอียดสินค้า — placeholder content",
  },
  {
    value: "size",
    label: "ขนาดสินค้า",
    content: "ขนาดสินค้า — placeholder content",
  },
];

// Placeholder copy/contact details — swap for real content when it's ready.
const CONTACT = {
  tag: "ติดต่อเรา",
  title: "ค้นหาเราได้ที่กรุงเทพฯ พร้อมให้คำปรึกษาและช่วยเหลือคุณอย่างรวดเร็ว",
  description:
    "Better เป็นทีมที่ให้บริการโซลูชันครบวงจรและปฏิบัติได้จริงสำหรับธุรกิจในประเทศไทย",
  center: { lat: 13.7466, lng: 100.5347 }, // Siam Paragon, Bangkok — placeholder
  contact: {
    address: "123 ถ.สุขุมวิท แขวงคลองตัน เขตคลองเตย กรุงเทพฯ 10110",
    phones: ["02-123-4567", "081-234-5678"],
    emails: ["contact@example.com", "support@example.com"],
  },
};

const TestPage = () => {
  return (
    <>
      <div
        style={{
          width: "100%",
          maxWidth: 600,
          margin: "40px auto",
          padding: "0 16px",
        }}
      >
        <Accordion items={ACCORDION_ITEMS} />
      </div>

      <ContactMap
        tag={CONTACT.tag}
        title={CONTACT.title}
        description={CONTACT.description}
        center={CONTACT.center}
        contact={CONTACT.contact}
      />
    </>
  );
};

export default TestPage;
