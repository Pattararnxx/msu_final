"use client";

import { APIProvider, Map, Marker } from "@vis.gl/react-google-maps";
import Icon from "@/component/icon/icon";
import styles from "./contact-map.module.css";

interface LatLng {
  lat: number;
  lng: number;
}

interface ContactInfo {
  address: string;
  phones: string[];
  emails: string[];
}

interface ContactMapProps {
  /** Small bracketed label above the heading, e.g. "ติดต่อเรา" */
  tag: string;
  title: string;
  description: string;
  /** Map center / marker position */
  center: LatLng;
  zoom?: number;
  contact: ContactInfo;
}

// Uses @vis.gl/react-google-maps (the JS Maps SDK, not the Embed iframe) so
// the map is interactive — pan/zoom/gesture handling — like the reference
// design. Requires NEXT_PUBLIC_GOOGLE_API_KEY with the "Maps JavaScript API"
// enabled in Google Cloud Console.
export default function ContactMap({
  tag,
  title,
  description,
  center,
  zoom = 16,
  contact,
}: ContactMapProps) {
  const apiKey = process.env.NEXT_PUBLIC_GOOGLE_API_KEY;

  return (
    <section className={styles.section}>
      <div className={styles.header}>
        <div className={styles.headerLeft}>
          <p className={styles.tag}>[{tag}]</p>
          <h2 className={styles.title}>{title}</h2>
        </div>
        <p className={styles.description}>{description}</p>
      </div>

      <div className={styles.mapWrap}>
        {apiKey ? (
          <APIProvider apiKey={apiKey}>
            <Map
              className={styles.map}
              defaultCenter={center}
              defaultZoom={zoom}
              gestureHandling="cooperative"
              disableDefaultUI={false}
              fullscreenControl={false}
              streetViewControl={false}
            >
              <Marker position={center} />
            </Map>
          </APIProvider>
        ) : (
          // Missing/unset NEXT_PUBLIC_GOOGLE_API_KEY — fail visibly instead
          // of silently rendering a blank map.
          <div className={styles.mapFallback}>
            ตั้งค่า NEXT_PUBLIC_GOOGLE_API_KEY ใน .env เพื่อแสดงแผนที่
          </div>
        )}

        {/* Hover/focus reveal instead of an always-visible card — the panel
            shares the button's shadow so it reads as one surface lifting up. */}
        <div className={styles.infoTrigger}>
          <button type="button" className={styles.infoButton}>
            <Icon src="/icon/regular/map-pin.svg" size={16} />
            ข้อมูลติดต่อ
          </button>

          <div className={styles.infoPanel}>
            <div className={styles.cardRow}>
              <span className={styles.cardIcon}>
                <Icon src="/icon/regular/map-pin.svg" size={18} />
              </span>
              <div>
                <p className={styles.cardLabel}>ที่อยู่</p>
                <p className={styles.cardValue}>{contact.address}</p>
              </div>
            </div>

            <div className={styles.cardRow}>
              <span className={styles.cardIcon}>
                <Icon src="/icon/regular/phone.svg" size={18} />
              </span>
              <div>
                <p className={styles.cardLabel}>เบอร์โทร & LINE</p>
                {contact.phones.map((phone) => (
                  <p className={styles.cardValue} key={phone}>
                    {phone}
                  </p>
                ))}
              </div>
            </div>

            <div className={styles.cardRow}>
              <span className={styles.cardIcon}>
                <Icon src="/icon/regular/envelope.svg" size={18} />
              </span>
              <div>
                <p className={styles.cardLabel}>อีเมล</p>
                {contact.emails.map((email) => (
                  <p className={styles.cardValue} key={email}>
                    {email}
                  </p>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
