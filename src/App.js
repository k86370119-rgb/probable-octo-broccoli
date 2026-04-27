import { useState, useRef, useEffect } from "react";

const COLORS = {
  black: "#1a1a1a", red: "#BB0000", green: "#006600",
  white: "#FFFFFF", lightGreen: "#e8f5e9", lightRed: "#fff0f0",
};

const CBC_SUBJECTS = ["Mathematics","English","Kiswahili","Science & Technology","Social Studies","Creative Arts","Religious Education"];
const SECONDARY_SUBJECTS = ["Mathematics","English","Kiswahili","Biology","Chemistry","Physics","History & Government","Geography","Computer Studies","Business Studies","Agriculture"];

const ShieldIcon = () => (
  <svg width="38" height="38" viewBox="0 0 38 38" fill="none">
    <ellipse cx="19" cy="19" rx="18" ry="18" fill="#BB0000" stroke="#c8960c" strokeWidth="2"/>
    <rect x="17" y="6" width="4" height="26" rx="2" fill="#c8960c"/>
    <ellipse cx="19" cy="19" rx="7" ry="11" fill="none" stroke="#c8960c" strokeWidth="2"/>
    <circle cx="19" cy="19" r="3" fill="#c8960c"/>
  </svg>
);

const TypingDots = () => (
  <div style={{display:"flex",gap:5,alignItems:"center",padding:"10px 0"}}>
    {[0,1,2].map(i=>(
      <div key={i} style={{width:9,height:9,borderRadius:"50%",background:"#006600",animation:`bounce 1.2s ${i*0.2}s infinite`}}/>
    ))}
    <style>{`@keyframes bounce{0%,80%,100%{transform:translateY(0)}40%{transform:translateY(-8px)}}`}</style>
  </div>
);

export default function App() {
  const [screen, setScreen] = useState("home");
  const [level, setLevel] = useState(null);
  const [subject, setSubject] = useState(null);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef(null);

  useEffect(()=>{ bottomRef.current?.scrollIntoView({behavior:"smooth"}); },[messages,loading]);

  const subjects = level==="CBC" ? CBC_SUBJECTS : SECONDARY_SUBJECTS;

  const systemPrompt = `You are MsomaBuddy, a friendly AI study assistant for Kenyan students.
You help ${level==="CBC"?"CBC primary school":"secondary school (Form 1-4, KCSE)"} students understand ${subject}.
- Use simple clear language a Kenyan student understands
- Use Kenyan examples: matatus, shillings, Nairobi, markets, maize, Lake Victoria
- Be warm and encouraging like a cool older sibling
- When explaining math show step-by-step working
- If asked to quiz give 3 multiple choice questions with answers at the end
- Use Swahili encouragement: "Sawa!", "Vizuri sana!", "Hongera!"
- Keep responses concise and easy to read on a phone
- Always end with an encouraging line`;

  const sendMessage = async (text) => {
    if (!text.trim()) return;
    const userMsg = {role:"user",content:text};
    const newMessages = [...messages, userMsg];
    setMessages(newMessages);
    setInput("");
    setLoading(true);
    try {
      const response = await fetch("https://api.anthropic.com/v1/messages",{
        method:"POST",
        headers:{"Content-Type":"application/json"},
        body:JSON.stringify({
          model:"claude-sonnet-4-20250514",
          max_tokens:1000,
          system:systemPrompt,
          messages:newMessages,
        }),
      });
      const data = await response.json();
      const reply = data.content?.map(b=>b.text||"").join("")||"Samahani, try again!";
      setMessages([...newMessages,{role:"assistant",content:reply}]);
    } catch {
      setMessages([...newMessages,{role:"assistant",content:"Oops! Something went wrong. Try again! 🙏"}]);
    }
    setLoading(false);
  };

  const quickActions = [
    {label:"📖 Explain a concept",text:"Explain the main concepts in "+subject},
    {label:"🧪 Quiz Me!",text:"Give me a quiz on "+subject},
    {label:"💡 Study Tip",text:"Give me a study tip for "+subject},
  ];

  if (screen==="home") return (
    <div style={styles.page}>
      <div style={styles.stripTop}/><div style={styles.stripRed}/><div style={styles.stripBottom}/>
      <div style={styles.homeCard}>
        <div style={{display:"flex",alignItems:"center",gap:14,marginBottom:6,justifyContent:"center"}}>
          <ShieldIcon/><h1 style={styles.logo}>MsomaBuddy</h1>
        </div>
        <p style={styles.tagline}>🇰🇪 Kenya's Smart Study Partner</p>
        <p style={styles.subtitle}>AI-powered help for <b>CBC</b> & <b>Secondary</b> students.<br/>Available 24/7 — even during holidays!</p>
        <div style={styles.featureGrid}>
          {["📐 Maths","💻 Computer Studies","🧪 Sciences","📖 Languages","🌍 Humanities","🎨 CBC Subjects"].map(f=>(
            <div key={f} style={styles.featureChip}>{f}</div>
          ))}
        </div>
        <button style={styles.startBtn} onClick={()=>setScreen("level")}>Anza Kusoma! 🚀</button>
        <p style={styles.swahiliNote}>( "Anza Kusoma" = Start Studying )</p>
      </div>
    </div>
  );

  if (screen==="level") return (
    <div style={styles.page}>
      <div style={styles.stripTop}/><div style={styles.stripRed}/><div style={styles.stripBottom}/>
      <div style={styles.card}>
        <button style={styles.back} onClick={()=>setScreen("home")}>← Back</button>
        <div style={{textAlign:"center",marginBottom:24}}>
          <ShieldIcon/><h2 style={styles.cardTitle}>Who are you? 🎓</h2>
          <p style={styles.cardSub}>Select your level to get started</p>
        </div>
        <div style={styles.levelGrid}>
          {[{id:"CBC",label:"CBC Student",desc:"Grade 1 – 9",emoji:"🏫"},{id:"Secondary",label:"Secondary Student",desc:"Form 1 – 4 (KCSE)",emoji:"📚"}].map(l=>(
            <button key={l.id} style={styles.levelCard} onClick={()=>{setLevel(l.id);setScreen("subject");}}>
              <span style={{fontSize:40}}>{l.emoji}</span>
              <strong style={{color:"#1a1a1a",fontSize:17}}>{l.label}</strong>
              <span style={{color:"#666",fontSize:14}}>{l.desc}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );

  if (screen==="subject") return (
    <div style={styles.page}>
      <div style={styles.stripTop}/><div style={styles.stripRed}/><div style={styles.stripBottom}/>
      <div style={styles.card}>
        <button style={styles.back} onClick={()=>setScreen("level")}>← Back</button>
        <div style={{textAlign:"center",marginBottom:20}}>
          <ShieldIcon/><h2 style={styles.cardTitle}>Pick a Subject 📚</h2>
          <p style={styles.cardSub}>{level} Curriculum</p>
        </div>
        <div style={styles.subjectGrid}>
          {subjects.map(s=>(
            <button key={s} style={styles.subjectBtn} onClick={()=>{
              setSubject(s);
              setMessages([{role:"assistant",content:`Habari! 👋 I'm MsomaBuddy, your study partner for ${s}!\n\nAsk me anything or say "Quiz Me!" to test yourself.\n\nTuanze! 💪🇰🇪`}]);
              setScreen("chat");
            }}>{s}</button>
          ))}
        </div>
      </div>
    </div>
  );

  return (
    <div style={styles.chatPage}>
      <div style={styles.chatHeader}>
        <button style={styles.backWhite} onClick={()=>setScreen("subject")}>←</button>
        <div style={{display:"flex",alignItems:"center",gap:10}}>
          <ShieldIcon/>
          <div>
            <div style={{fontWeight:800,fontSize:16,color:"#fff",fontFamily:"Georgia,serif"}}>MsomaBuddy</div>
            <div style={{fontSize:12,color:"#c8ffc8"}}>{subject} • {level}</div>
          </div>
        </div>
        <button style={styles.newChat} onClick={()=>{setMessages([]);setScreen("subject");}}>New</button>
      </div>
      <div style={styles.chatBody}>
        {messages.map((m,i)=>(
          <div key={i} style={{display:"flex",justifyContent:m.role==="user"?"flex-end":"flex-start",marginBottom:12}}>
            {m.role==="assistant"&&<div style={styles.avatarSmall}><ShieldIcon/></div>}
            <div style={m.role==="user"?styles.userBubble:styles.aiBubble}>
              {m.content.split("\n").map((line,j)=>(<p key={j} style={{margin:"2px 0",lineHeight:1.55}}>{line}</p>))}
            </div>
          </div>
        ))}
        {loading&&(
          <div style={{display:"flex",alignItems:"center",gap:8}}>
            <div style={styles.avatarSmall}><ShieldIcon/></div>
            <div style={styles.aiBubble}><TypingDots/></div>
          </div>
        )}
        <div ref={bottomRef}/>
      </div>
      {messages.length<=1&&(
        <div style={styles.quickRow}>
          {quickActions.map(a=>(<button key={a.label} style={styles.quickBtn} onClick={()=>sendMessage(a.text)}>{a.label}</button>))}
        </div>
      )}
      <div style={styles.inputRow}>
        <input style={styles.input} value={input} onChange={e=>setInput(e.target.value)}
          onKeyDown={e=>e.key==="Enter"&&sendMessage(input)} placeholder="Ask anything... 🇰🇪"/>
        <button style={styles.sendBtn} onClick={()=>sendMessage(input)} disabled={loading||!input.trim()}>➤</button>
      </div>
    </div>
  );
}

const styles = {
  page:{minHeight:"100vh",background:"#f4f4f4",display:"flex",alignItems:"center",justifyContent:"center",flexDirection:"column",position:"relative",padding:20,fontFamily:"Georgia,serif"},
  stripTop:{position:"fixed",top:0,left:0,right:0,height:8,background:"#1a1a1a",zIndex:99},
  stripRed:{position:"fixed",top:8,left:0,right:0,height:6,background:"#BB0000",zIndex:99},
  stripBottom:{position:"fixed",bottom:0,left:0,right:0,height:8,background:"#006600",zIndex:99},
  homeCard:{background:"#fff",borderRadius:20,padding:"36px 28px",maxWidth:420,width:"100%",boxShadow:"0 8px 40px rgba(0,102,0,0.15)",border:"3px solid #006600",textAlign:"center",marginTop:20},
  logo:{fontSize:32,fontWeight:900,color:"#006600",margin:0,fontFamily:"Georgia,serif",letterSpacing:-1},
  tagline:{fontSize:15,color:"#BB0000",fontWeight:700,margin:"4px 0 12px"},
  subtitle:{fontSize:15,color:"#444",lineHeight:1.6,margin:"0 0 20px"},
  featureGrid:{display:"flex",flexWrap:"wrap",gap:8,justifyContent:"center",marginBottom:24},
  featureChip:{background:"#e8f5e9",border:"1.5px solid #006600",borderRadius:20,padding:"5px 13px",fontSize:13,color:"#006600",fontWeight:600},
  startBtn:{background:"linear-gradient(135deg,#006600,#009900)",color:"#fff",border:"none",borderRadius:14,padding:"15px 40px",fontSize:18,fontWeight:800,cursor:"pointer",width:"100%",fontFamily:"Georgia,serif"},
  swahiliNote:{fontSize:12,color:"#999",marginTop:8},
  card:{background:"#fff",borderRadius:20,padding:"28px 22px",maxWidth:440,width:"100%",boxShadow:"0 8px 40px rgba(0,0,0,0.1)",border:"3px solid #1a1a1a",marginTop:20},
  cardTitle:{fontSize:24,fontWeight:900,color:"#1a1a1a",margin:"12px 0 4px",fontFamily:"Georgia,serif"},
  cardSub:{color:"#777",fontSize:14,margin:0},
  back:{background:"none",border:"none",color:"#006600",fontSize:15,fontWeight:700,cursor:"pointer",padding:"0 0 16px",fontFamily:"Georgia,serif"},
  levelGrid:{display:"flex",flexDirection:"column",gap:14},
  levelCard:{display:"flex",flexDirection:"column",alignItems:"center",gap:4,padding:"22px 16px",borderRadius:14,border:"2.5px solid #006600",background:"#e8f5e9",cursor:"pointer",fontFamily:"Georgia,serif"},
  subjectGrid:{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10},
  subjectBtn:{padding:"13px 8px",borderRadius:12,border:"2px solid #BB0000",background:"#fff0f0",color:"#1a1a1a",fontWeight:700,fontSize:13,cursor:"pointer",fontFamily:"Georgia,serif"},
  chatPage:{display:"flex",flexDirection:"column",height:"100vh",background:"#f0f0f0",fontFamily:"Georgia,serif"},
  chatHeader:{background:"linear-gradient(135deg,#1a1a1a 0%,#006600 100%)",padding:"14px 16px",display:"flex",alignItems:"center",justifyContent:"space-between",boxShadow:"0 2px 12px rgba(0,0,0,0.3)"},
  backWhite:{background:"none",border:"none",color:"#fff",fontSize:22,cursor:"pointer",fontWeight:700},
  newChat:{background:"#BB0000",border:"none",color:"#fff",borderRadius:8,padding:"6px 14px",fontSize:13,fontWeight:700,cursor:"pointer"},
  chatBody:{flex:1,overflowY:"auto",padding:"16px 12px",display:"flex",flexDirection:"column"},
  avatarSmall:{width:36,height:36,marginRight:8,flexShrink:0,marginTop:4},
  aiBubble:{background:"#fff",borderRadius:"4px 18px 18px 18px",padding:"10px 14px",maxWidth:"80%",fontSize:14,lineHeight:1.6,boxShadow:"0 2px 8px rgba(0,0,0,0.08)",color:"#1a1a1a",border:"1.5px solid #006600"},
  userBubble:{background:"linear-gradient(135deg,#006600,#009900)",color:"#fff",borderRadius:"18px 4px 18px 18px",padding:"10px 14px",maxWidth:"78%",fontSize:14,lineHeight:1.6},
  quickRow:{display:"flex",gap:8,padding:"8px 12px",overflowX:"auto",background:"#fff",borderTop:"1px solid #eee"},
  quickBtn:{whiteSpace:"nowrap",padding:"8px 14px",borderRadius:20,border:"2px solid #BB0000",background:"#fff0f0",color:"#BB0000",fontSize:13,fontWeight:700,cursor:"pointer",fontFamily:"Georgia,serif"},
  inputRow:{display:"flex",gap:8,padding:"10px 12px 18px",background:"#fff",borderTop:"2px solid #006600"},
  input:{flex:1,padding:"12px 16px",borderRadius:24,border:"2px solid #006600",fontSize:15,outline:"none",fontFamily:"Georgia,serif",background:"#e8f5e9"},
  sendBtn:{background:"#BB0000",color:"#fff",border:"none",borderRadius:"50%",width:48,height:48,fontSize:20,cursor:"pointer",fontWeight:700},
};
