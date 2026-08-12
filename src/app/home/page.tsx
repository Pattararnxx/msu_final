import Image from "next/image";
import Navbar from "@/component/navbar/navbar";
import Icon from "@/component/icon/icon";
import PropertySection, {
  type PropertySectionItem,
} from "@/component/property-section/property-section";
import PropertyFilter from "@/component/property-filter/property-filter";
import PropertySearch from "@/component/property-search/property-search";
import Breadcrumbs from "@/component/breadcrumbs/breadcrumbs";
import { Footer } from "@/component/footer/footer";
import styles from "./page.module.scss";

// Wording, provinces, and prices are placeholders — swap for real listing
// data when it's ready. Section rhythm (hero → featured → category grids →
// footer) is modeled on kkpbetter.kkpfg.com/th/product, re-themed from
// banking products to real-estate listings.

const FEATURED: PropertySectionItem[] = [
  {
    href: "#",
    province: "นนทบุรี",
    name: "บ้านสวย ราชพฤกษ์ วิว 2",
    price: 11824300,
    isNew: true,
    priority: true,
    image: "/images/abby-rurenko-uOYak90r4L0-unsplash.jpg",
  },
  {
    href: "#",
    province: "กรุงเทพมหานคร",
    name: "คอนโด เพลส ดอนเมือง",
    price: 3298000,
    isNew: true,
    image: "/images/avi-werde-hHz4yrvxwlA-unsplash.jpg",
  },
  {
    href: "#",
    province: "ปทุมธานี",
    name: "ทาวน์โฮม รังสิต คลอง 3",
    price: 5238000,
    image: "/images/braden-jarvis-Z6WmHx0nQXw-unsplash.jpg",
  },
  {
    href: "#",
    province: "ชลบุรี",
    name: "บ้านเดี่ยว วิลล์ บางแสน",
    price: 6450000,
    isNew: true,
    image: "/images/clay-banks-NFz1Up96P8E-unsplash.jpg",
  },
  {
    href: "#",
    province: "เชียงใหม่",
    name: "หมู่บ้าน ริมดอย สันทราย",
    price: 4120000,
    image: "/images/clay-banks-urH155LONWs-unsplash.jpg",
  },
];

const DETACHED_HOUSES: PropertySectionItem[] = [
  {
    href: "#",
    province: "ปทุมธานี",
    name: "บ้านเดี่ยว สุขสมบูรณ์ รังสิต",
    price: 6200000,
    isNew: true,
    image: "/images/frames-for-your-heart-2d4lAQAlbDA-unsplash.jpg",
  },
  {
    href: "#",
    province: "เชียงใหม่",
    name: "บ้านเดี่ยว ริมดอย หางดง",
    price: 4850000,
    image: "/images/frames-for-your-heart-mR1CIDduGLc-unsplash.jpg",
  },
  {
    href: "#",
    province: "ชลบุรี",
    name: "บ้านเดี่ยว ทะเลสวย บางแสน",
    price: 7300000,
    isNew: true,
    image: "/images/francesca-tosolini-tHkJAMcO3QE-unsplash.jpg",
  },
  {
    href: "#",
    province: "นครราชสีมา",
    name: "บ้านเดี่ยว สวนผึ้ง ปากช่อง",
    price: 3950000,
    image: "/images/jason-dent-w3eFhqXjkZE-unsplash.jpg",
  },
];

const TOWNHOMES: PropertySectionItem[] = [
  {
    href: "#",
    province: "กรุงเทพมหานคร",
    name: "ทาวน์เฮาส์ ลาดพร้าว 101",
    price: 3450000,
    isNew: true,
    image: "/images/lotus-design-n-print-wRzBarqn3hs-unsplash.jpg",
  },
  {
    href: "#",
    province: "นนทบุรี",
    name: "ทาวน์เฮาส์ ราชพฤกษ์ วิว",
    price: 4120000,
    image: "/images/phil-hearing-IYfp2Ixe9nM-unsplash.jpg",
  },
  {
    href: "#",
    province: "สมุทรปราการ",
    name: "ทาวน์เฮาส์ บางนา กม.8",
    price: 2980000,
    image: "/images/ronnie-george-z11gbBo13ro-unsplash.jpg",
  },
  {
    href: "#",
    province: "ปทุมธานี",
    name: "ทาวน์เฮาส์ คลองหลวง ธานี",
    price: 3210000,
    isNew: true,
    image: "/images/scott-webb-1ddol8rgUH8-unsplash.jpg",
  },
];

const CONDOS: PropertySectionItem[] = [
  {
    href: "#",
    province: "กรุงเทพมหานคร",
    name: "คอนโด สุขุมวิท 71",
    price: 2650000,
    isNew: true,
    image: "/images/sieuwert-otterloo-aren8nutd1Q-unsplash.jpg",
  },
  {
    href: "#",
    province: "กรุงเทพมหานคร",
    name: "คอนโด อารีย์ การ์เดนส์",
    price: 3890000,
    image: "/images/steven-ungermann-ydudT6TqqmI-unsplash.jpg",
  },
  {
    href: "#",
    province: "ชลบุรี",
    name: "คอนโด พัทยาใต้ ซีวิว",
    price: 1980000,
    image: "/images/tazz-anderson-ya9POX9IxVM-unsplash.jpg",
  },
];

const LAND: PropertySectionItem[] = [
  {
    href: "#",
    province: "ระยอง",
    name: "ที่ดินเปล่า บ้านฉาง ใกล้ทะเล",
    price: 2100000,
    image: "/images/webaliser-_TPTXZd9mOo-unsplash.jpg",
  },
  {
    href: "#",
    province: "เชียงราย",
    name: "ที่ดินเปล่า แม่ริม วิวดอย",
    price: 1450000,
    isNew: true,
    image: "/images/wes-fischer-g39p1kDjvSY-unsplash.jpg",
  },
];

const HERO_IMAGE = "/images/phil-hearing-IYfp2Ixe9nM-unsplash.jpg";

const Home = () => {
  return (
    <div className={styles.page}>
      <Navbar />

      <div className={styles.hero}>
        <Image
          src={HERO_IMAGE}
          alt=""
          fill
          priority
          sizes="100vw"
          className={styles.heroImage}
        />

        <div className={styles.heroContent}>
          <h1 className={styles.heroTitle}>
            Better <span className={styles.heroAccent}>Properties</span>
          </h1>
          <p className={styles.heroSubtitle}>
            อสังหาริมทรัพย์คุณภาพ คัดสรรมาเพื่อคุณ
          </p>
          <p className={styles.heroTagline}>
            บ้าน คอนโด ทาวน์เฮาส์ ที่ดิน ครบจบในที่เดียว
          </p>
          <a
            href="#featured"
            className={styles.heroScroll}
            aria-label="เลื่อนลงเพื่อดูรายการ"
          >
            <Icon src="/icon/regular/caret-down.svg" size={16} />
          </a>
        </div>
      </div>

      <div className={styles.breadcrumbBar}>
        <Breadcrumbs
          items={[
            { label: "หน้าแรก", href: "/" },
            { label: "อสังหาริมทรัพย์แนะนำ" },
          ]}
        />
      </div>
      {/* Left: filter dropdowns. Right: search field. */}
      <div className={styles.toolbar}>
        <PropertyFilter />
        <PropertySearch />
      </div>

      <PropertySection
        id="featured"
        heading="อสังหาริมทรัพย์"
        accent="แนะนำ"
        items={FEATURED}
      />
      <PropertySection
        heading="อสังหาริมทรัพย์"
        accent="บ้านเดี่ยว"
        items={DETACHED_HOUSES}
      />
      <PropertySection
        heading="อสังหาริมทรัพย์"
        accent="ทาวน์เฮาส์"
        items={TOWNHOMES}
      />
      <PropertySection
        heading="อสังหาริมทรัพย์"
        accent="คอนโดมิเนียม"
        items={CONDOS}
      />
      <PropertySection heading="อสังหาริมทรัพย์" accent="ที่ดิน" items={LAND} />

      <Footer />
      <Breadcrumbs
        items={[
          { label: "หน้าแรก", href: "/" },
          { label: "อสังหาริมทรัพย์แนะนำ" },
        ]}
      />
    </div>
  );
};

export default Home;
