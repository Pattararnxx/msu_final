import { Image } from "@mantine/core";
import Navbar from "@/component/navbar/navbar";

const Home = () => {
  return (
    <>
      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
        <span
          style={{
            fontFamily: "'Times New Roman', Times, serif",
            fontSize: "100px",
          }}
        >
          Ieat is on
        </span>
        <Image
          src="/logo/hello_logo.svg"
          alt=""
          h={32}
          w="auto"
          fit="contain"
        />
      </div>
    </>
  );
};

export default Home;
