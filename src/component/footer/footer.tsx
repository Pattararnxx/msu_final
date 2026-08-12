import styles from "./Footer.module.scss";
import Image from "next/image";

export const Footer = () => {
  return (
    <div className={styles.container}>
      <div className={styles.content}>
        <div className={styles.logo}>
          <Image src="/icon/logo.svg" alt="Logo" width={80} height={60} />
          <p>
            แพลตฟอร์มจองตั๋วคอนเสิร์ตและ
            <br />
            งานอีเวนต์ที่คุณวางใจได้
          </p>
          <div className={styles.qrCode}>
            <Image
              src="/icon/qrcode.svg"
              alt="QR Code"
              width={80}
              height={80}
            />
            <p>
              สแกนเพื่อเริ่มต้นการเดินทาง
              <span>
                <br />
                ของคุณ
              </span>
            </p>
          </div>
        </div>
        <div className={styles.tab}>
          <h3>การจอง</h3>
          <p>จองบัตร</p>
          <p>ค้นหาตารางการแสดง</p>
          <p>การจองของฉัน</p>
          <p>ยกเลิก/เปลี่ยนวันที่</p>
        </div>
        <div className={styles.tab}>
          <h3>บริษัท</h3>
          <p>เกี่ยวกับเรา</p>
          <p>ข่าวสารและโปรโมชัน</p>
          <p>ร่วมงานกับเรา</p>
          <p>ติดต่อเรา</p>
        </div>
        <div className={styles.tab}>
          <h3>ช่วยเหลือ</h3>
          <p>ศูนย์ช่วยเหลือ</p>
          <p>คำถามที่พบบ่อย</p>
          <p>ข้อกำหนดการใช้บริการ</p>
          <p>นโยบายความเป็นส่วนตัว</p>
        </div>
      </div>
    </div>
  );
};
