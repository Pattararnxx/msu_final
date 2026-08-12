import Navbar from "@/component/navbar/navbar";
import { ChatbotProvider } from "@/component/chatbot/chatbot-context";
import ChatbotShell from "@/component/chatbot-shell/chatbot-shell";

const Home = () => {
  return (
    <ChatbotProvider>
      <ChatbotShell>
        <Navbar></Navbar>
        <div></div>
      </ChatbotShell>
    </ChatbotProvider>
  );
};

export default Home;
