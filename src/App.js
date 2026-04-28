import { useState, useRef, useEffect } from "react";

const OPENROUTER_KEY = "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";
const OPENROUTER_URL = "https://openrouter.ai/api/v1/chat/completions";

const COLORS = {
  black: "#1a1a1a", red: "#BB0000", green: "#006600",
  white: "#FFFFFF", lightGreen: "#e8f5e9", lightRed: "#fff0f0", gold: "#c8960c",
};

const CBC_SUBJECTS = ["Mathematics","English","Kiswahili","Science & Technology","Social Studies","Creative Arts","Religious Education"];
const SECONDARY_SUBJECTS = ["Mathematics","English","Kiswahili","Biology","Chemistry","Physics","History & Government","Geography","Computer Studies","Business Studies","Agriculture"];

const ShieldIcon = ({ size=38 }) => (
  <svg width={size} height={size} viewBox="0 0 38 38" fill="none">
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

const FounderCard = () => (
  <div style={{margin:"24px 0 8px",padding:"18px",borderRadius:16,background:"linear-gradient(135deg,#1a1a1a,#006600)",border:"2px solid #c8960c",textAlign:"center"}}>
    <img src="https://i.postimg.cc/ZKZJmR9J/IMG-20260321-WA0183.jpg" alt="Kelsey"
      style={{width:80,height:80,borderRadius:"50%",objectFit:"cover",border:"3px solid #c8960c",marginBottom:10}}/>
    <p style={{color:"#c8960c",fontWeight:900,fontSize:15,margin:"4px 0",fontFamily:"Georgia,serif"}}>👩‍💻 Made by Kelsey Wangui Wanjiku</p>
    <p style={{color:"#fff",fontSize:12,margin:"2px 0"}}>Education & Tech Enthusiast 🎓</p>
    <p style={{color:"#c8ffc8",fontSize:12,margin:"2px 0"}}>Kenya 🇰🇪 | MsomaBuddy Founder</p>
  </div>
);

const EDUCATION_SYSTEM = `You are MsomaBuddy, a STRICTLY educational AI assistant for Kenyan students ONLY.
STRICT RULES:
1. ONLY answer questions related to school subjects, education, studying, and learning
2. If asked ANYTHING not educational respond ONLY with: "Samahani! MsomaBuddy is strictly for education only. Please ask me about your school subjects! 📚🇰🇪"
3. Help CBC (Grade 1-9) and Secondary (Form 1-4 KCSE) Kenyan students
4. Use Kenyan examples: matatus, shillings, Nairobi, Lake Victoria, maize farms
5. Be warm and encouraging like a cool older sibling
6. Show step-by-step working for math problems
7. If asked to quiz give 3 multiple choice questions with answers at the end
8. Use Swahili encouragement: "Sawa!", "Vizuri sana!", "Hongera!"
9. Always end with an encouraging line
10. NEVER discuss non-educational topics under ANY circumstances`;
export default function App() {
  const [screen, setScreen] = useState("home");
  const [level, setLevel] = useState(null);
  const [subject, setSubject] = useState(null);
  const [mode, setMode] = useState("chat");
  const [messages, setMessages] = useState([]);
  const [displayMessages, setDisplayMessages] = useState([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [imagePreview, setImagePreview] = useState(null);
  const [imageBase64, setImageBase64] = useState(null);
  const [videoPreview, setVideoPreview] = useState(null);
  const [researchTopic, setResearchTopic] = useState("");
  const [recording, setRecording] = useState(false);
  const [mediaRecorder, setMediaRecorder] = useState(null);
  const [notification, setNotification] = useState(null);
  const bottomRef = useRef(null);
  const photoRef = useRef(null);
  const cameraRef = useRef(null);
  const fileRef = useRef(null);
  const videoRef = useRef(null);
  const videoRecordRef = useRef(null);

  useEffect(()=>{ bottomRef.current?.scrollIntoView({behavior:"smooth"}); },[displayMessages,loading]);

  const showNotif = (msg, color="#006600") => {
    setNotification({msg, color});
    setTimeout(()=>setNotification(null), 3000);
  };

  const subjects = level==="CBC" ? CBC_SUBJECTS : SECONDARY_SUBJECTS;

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (!file.type.startsWith("image/")) { showNotif("📚 Images only for study purposes!","#BB0000"); return; }
    const reader = new FileReader();
    reader.onload = (ev) => {
      setImagePreview(ev.target.result);
      setImageBase64(ev.target.result.split(",")[1]);
      setVideoPreview(null);
      showNotif("✅ Photo ready! Tap Explain This to analyze it.");
    };
    reader.readAsDataURL(file);
  };

  const handleVideoUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (!file.type.startsWith("video/")) { showNotif("📚 Videos only!","#BB0000"); return; }
    const url = URL.createObjectURL(file);
    setVideoPreview(url);
    setImagePreview(null);
    setImageBase64(null);
    showNotif("✅ Video saved as study material!");
  };

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (file.type.startsWith("image/")) { handleImageUpload(e); return; }
    showNotif(`✅ File "${file.name}" ready!`);
    setInput(`I have a study document called "${file.name}". Please help me understand it.`);
    setMode("chat");
  };

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video:true, audio:true });
      if (videoRecordRef.current) videoRecordRef.current.srcObject = stream;
      const mr = new MediaRecorder(stream);
      const chunks = [];
      mr.ondataavailable = e => chunks.push(e.data);
      mr.onstop = () => {
        const blob = new Blob(chunks, { type:"video/webm" });
        setVideoPreview(URL.createObjectURL(blob));
        stream.getTracks().forEach(t => t.stop());
        showNotif("✅ Video recorded!");
      };
      mr.start();
      setMediaRecorder(mr);
      setRecording(true);
    } catch { showNotif("📷 Allow camera access!","#BB0000"); }
  };

  const stopRecording = () => {
    if (mediaRecorder) { mediaRecorder.stop(); setRecording(false); setMediaRecorder(null); }
  };

  const sendMessage = async (text, imgBase64=null) => {
    if (!text.trim() && !imgBase64) return;
    const userContent = imgBase64
      ? [{ type:"image_url", image_url:{ url:`data:image/jpeg;base64,${imgBase64}` }},
         { type:"text", text: text || "Please explain this educational image step by step for a Kenyan student." }]
      : text;
    const userMsg = { role:"user", content: userContent };
    const displayMsg = { role:"user", content: text || "📸 Photo sent!", image: imgBase64 ? imagePreview : null };
    const newMessages = [...messages, userMsg];
    setMessages(newMessages);
    setDisplayMessages(prev=>[...prev, displayMsg]);
    setImagePreview(null);
    setImageBase64(null);
    setInput("");
    setLoading(true);
    try {
      const response = await fetch(OPENROUTER_URL, {
        method:"POST",
        headers:{
          "Content-Type":"application/json",
          "Authorization":`Bearer ${OPENROUTER_KEY}`,
          "HTTP-Referer":"https://probable-octo-broccoli-six.vercel.app",
          "X-Title":"MsomaBuddy",
        },
        body:JSON.stringify({
          model:"anthropic/claude-3-haiku",
          max_tokens:1000,
          messages:[
            { role:"system", content: EDUCATION_SYSTEM + `\nStudent level: ${level}, Subject: ${subject}` },
            ...newMessages,
          ],
        }),
      });
      const data = await response.json();
      const reply = data.choices?.[0]?.message?.content || "Samahani, try again! 🙏";
      setMessages(prev=>[...prev,{role:"assistant",content:reply}]);
      setDisplayMessages(prev=>[...prev,{role:"assistant",content:reply}]);
    } catch {
      const err = "Oops! Check internet and try again! 🙏";
      setMessages(prev=>[...prev,{role:"assistant",content:err}]);
      setDisplayMessages(prev=>[...prev,{role:"assistant",content:err}]);
    }
    setLoading(false);
  };

  const sendResearch = async () => {
    if (!researchTopic.trim()) return;
    const prompt = `Research Topic: "${researchTopic}"\nProvide a comprehensive student-friendly summary for ${level} ${subject} Kenya curriculum. Include key concepts, facts, examples and exam tips.`;
    setResearchTopic("");
    setMode("chat");
    await sendMessage(prompt);
  };

  const quickActions = [
    {label:"📖 Explain concept", text:`Explain main concepts in ${subject}`},
    {label:"🧪 Quiz Me!", text:`Give me a 3-question quiz on ${subject}`},
    {label:"💡 Study Tip", text:`Give me top 3 study tips for ${subject}`},
    {label:"📝 Past Paper", text:`Give me a past paper question for ${subject} in Kenya with answer`},
  ];

  if (screen==="home") return (
    <div style={S.page}>
      <div style={S.stripTop}/><div style={S.stripRed}/><div style={S.stripBottom}/>
      <div style={S.homeCard}>
        <div style={{display:"flex",alignItems:"center",gap:14,marginBottom:6,justifyContent:"center"}}>
          <ShieldIcon/><h1 style={S.logo}>MsomaBuddy</h1>
        </div>
        <p style={S.tagline}>🇰🇪 Kenya's Smart Study Partner</p>
        <div style={S.v2Badge}>⚡ V2 — Photo + Video + Research!</div>
        <p style={S.subtitle}>AI-powered help for <b>CBC</b> & <b>Secondary</b> students.<br/>Strictly educational. Available 24/7! 📚</p>
        <div style={S.featureGrid}>
          {["📐 Maths","💻 Computer Studies","🧪 Sciences","📖 Languages","🌍 Humanities","🎨 CBC"].map(f=>(
            <div key={f} style={S.featureChip}>{f}</div>
          ))}
        </div>
        <div style={S.v2Features}>
          <div style={S.v2Card}><span style={{fontSize:24}}>📸</span><strong style={{fontSize:12,color:"#006600"}}>Snap Question</strong><span style={{fontSize:10,color:"#666"}}>Photo textbook questions</span></div>
          <div style={S.v2Card}><span style={{fontSize:24}}>🎥</span><strong style={{fontSize:12,color:"#006600"}}>Record Video</strong><span style={{fontSize:10,color:"#666"}}>Save study videos</span></div>
          <div style={S.v2Card}><span style={{fontSize:24}}>📁</span><strong style={{fontSize:12,color:"#006600"}}>Upload Files</strong><span style={{fontSize:10,color:"#666"}}>PDFs & documents</span></div>
          <div style={S.v2Card}><span style={{fontSize:24}}>🔬</span><strong style={{fontSize:12,color:"#006600"}}>Research</strong><span style={{fontSize:10,color:"#666"}}>Topic summaries</span></div>
        </div>
        <div style={{background:"#fff3f3",border:"1.5px solid #BB0000",borderRadius:10,padding:"8px 12px",marginBottom:16,fontSize:12,color:"#BB0000",fontWeight:700,textAlign:"center"}}>
          🚫 Strictly Education Only
        </div>
        <button style={S.startBtn} onClick={()=>setScreen("level")}>Anza Kusoma! 🚀</button>
        <p style={S.swahiliNote}>( "Anza Kusoma" = Start Studying )</p>
        <FounderCard/>
      </div>
    </div>
  );

  if (screen==="level") return (
    <div style={S.page}>
      <div style={S.stripTop}/><div style={S.stripRed}/><div style={S.stripBottom}/>
      <div style={S.card}>
        <button style={S.back} onClick={()=>setScreen("home")}>← Back</button>
        <div style={{textAlign:"center",marginBottom:24}}>
          <ShieldIcon/><h2 style={S.cardTitle}>Who are you? 🎓</h2>
          <p style={S.cardSub}>Select your level to get started</p>
        </div>
        <div style={S.levelGrid}>
          {[{id:"CBC",label:"CBC Student",desc:"Grade 1 – 9",emoji:"🏫"},{id:"Secondary",label:"Secondary Student",desc:"Form 1 – 4 (KCSE)",emoji:"📚"}].map(l=>(
            <button key={l.id} style={S.levelCard} onClick={()=>{setLevel(l.id);setScreen("subject");}}>
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
    <div style={S.page}>
      <div style={S.stripTop}/><div style={S.stripRed}/><div style={S.stripBottom}/>
      <div style={S.card}>
        <button style={S.back} onClick={()=>setScreen("level")}>← Back</button>
        <div style={{textAlign:"center",marginBottom:20}}>
          <ShieldIcon/><h2 style={S.cardTitle}>Pick a Subject 📚</h2>
          <p style={S.cardSub}>{level} Curriculum</p>
        </div>
        <div style={S.subjectGrid}>
          {subjects.map(s=>(
            <button key={s} style={S.subjectBtn} onClick={()=>{
              setSubject(s);
              setMessages([]);
              setDisplayMessages([{role:"assistant",content:`Habari! 👋 I'm MsomaBuddy V2!\n\n📸 Snap a photo of any textbook question\n🎥 Record or upload a study video\n📁 Upload PDFs or documents\n🔬 Use Research Mode\n💬 Or just ask me anything about ${s}!\n\nTuanze! 💪🇰🇪`}]);
              setScreen("chat");
            }}>{s}</button>
          ))}
        </div>
      </div>
    </div>
  );

  return (
    <div style={S.chatPage}>
      {notification&&(
        <div style={{position:"fixed",top:20,left:16,right:16,background:notification.color,color:"#fff",padding:"10px 16px",borderRadius:10,zIndex:999,fontWeight:700,fontSize:13,textAlign:"center"}}>
          {notification.msg}
        </div>
      )}
      <div style={S.chatHeader}>
        <button style={S.backWhite} onClick={()=>setScreen("subject")}>←</button>
        <div style={{display:"flex",alignItems:"center",gap:10}}>
          <ShieldIcon size={30}/>
          <div>
            <div style={{fontWeight:800,fontSize:15,color:"#fff",fontFamily:"Georgia,serif"}}>MsomaBuddy V2</div>
            <div style={{fontSize:10,color:"#c8ffc8"}}>{subject} • {level} • 🔒 Edu Only</div>
          </div>
        </div>
        <button style={S.newChat} onClick={()=>{setMessages([]);setDisplayMessages([]);setMode("chat");setScreen("subject");}}>New</button>
      </div>
      <div style={S.modeTabs}>
        {[{id:"chat",label:"💬 Chat"},{id:"photo",label:"📸 Photo"},{id:"video",label:"🎥 Video"},{id:"research",label:"🔬 Research"}].map(m=>(
          <button key={m.id} style={{...S.modeTab,...(mode===m.id?S.modeTabActive:{})}} onClick={()=>setMode(m.id)}>{m.label}</button>
        ))}
      </div>
      {mode==="photo"&&(
        <div style={S.panel}>
          <p style={S.panelTitle}>📸 Photo Mode — Education Only!</p>
          {imagePreview&&<img src={imagePreview} alt="preview" style={{width:"100%",maxHeight:180,objectFit:"contain",borderRadius:10,border:"2px solid #006600",marginBottom:10}}/>}
          <div style={S.btnGrid}>
            <button style={S.mediaBtn} onClick={()=>cameraRef.current.click()}>📷 Take Photo</button>
            <button style={S.mediaBtn} onClick={()=>photoRef.current.click()}>🖼️ From Gallery</button>
          </div>
          <input ref={cameraRef} type="file" accept="image/*" capture="environment" style={{display:"none"}} onChange={handleImageUpload}/>
          <input ref={photoRef} type="file" accept="image/*" style={{display:"none"}} onChange={handleImageUpload}/>
          {imagePreview&&<button style={{...S.startBtn,fontSize:14,padding:"12px",marginTop:8}} onClick={()=>{setMode("chat");sendMessage("",imageBase64);}}>🧠 Explain This Question!</button>}
          <p style={S.warning}>🚫 Educational images only</p>
        </div>
      )}
      {mode==="video"&&(
        <div style={S.panel}>
          <p style={S.panelTitle}>🎥 Video Mode — Study Material Only!</p>
          {recording&&<video ref={videoRecordRef} autoPlay muted style={{width:"100%",borderRadius:10,border:"2px solid #BB0000",marginBottom:10}}/>}
          {videoPreview&&!recording&&<video src={videoPreview} controls style={{width:"100%",borderRadius:10,border:"2px solid #006600",marginBottom:10}}/>}
          <div style={S.btnGrid}>
            {!recording
              ?<button style={{...S.mediaBtn,background:"#fff0f0",border:"2px solid #BB0000",color:"#BB0000"}} onClick={startRecording}>🔴 Record Video</button>
              :<button style={{...S.mediaBtn,background:"#BB0000",color:"#fff"}} onClick={stopRecording}>⏹ Stop Recording</button>
            }
            <button style={S.mediaBtn} onClick={()=>videoRef.current.click()}>📁 Upload Video</button>
          </div>
          <input ref={videoRef} type="file" accept="video/*" style={{display:"none"}} onChange={handleVideoUpload}/>
          <p style={S.warning}>🚫 Study videos only</p>
        </div>
      )}
      {mode==="research"&&(
        <div style={S.panel}>
          <p style={S.panelTitle}>🔬 Research Mode — Curriculum Based!</p>
          <div style={S.btnGrid}>
            <button style={S.mediaBtn} onClick={()=>fileRef.current.click()}>📁 Upload PDF</button>
            <button style={S.mediaBtn} onClick={()=>photoRef.current.click()}>🖼️ Upload Image</button>
          </div>
          <input ref={fileRef} type="file" accept=".pdf,.txt,image/*" style={{display:"none"}} onChange={handleFileUpload}/>
          <input ref={photoRef} type="file" accept="image/*" style={{display:"none"}} onChange={handleImageUpload}/>
          <textarea style={S.researchInput}
            placeholder={`e.g. "Photosynthesis Form 2 Biology"\n"Fractions Grade 5 Maths"`}
            value={researchTopic} onChange={e=>setResearchTopic(e.target.value)} rows={3}/>
          <button style={{...S.startBtn,fontSize:14,padding:"12px",marginTop:8}} onClick={sendResearch} disabled={!researchTopic.trim()}>🔬 Research This Topic!</button>
          <p style={S.warning}>🚫 Education topics only</p>
        </div>
      )}
      <div style={S.chatBody}>
        {displayMessages.map((m,i)=>(
          <div key={i} style={{display:"flex",justifyContent:m.role==="user"?"flex-end":"flex-start",marginBottom:12}}>
            {m.role==="assistant"&&<div style={S.avatarSmall}><ShieldIcon size={30}/></div>}
            <div style={m.role==="user"?S.userBubble:S.aiBubble}>
              {m.image&&<img src={m.image} alt="upload" style={{maxWidth:"100%",borderRadius:8,marginBottom:6}}/>}
              {m.content.split("\n").map((line,j)=>(<p key={j} style={{margin:"2px 0",lineHeight:1.55}}>{line}</p>))}
            </div>
          </div>
        ))}
        {loading&&(
          <div style={{display:"flex",alignItems:"center",gap:8}}>
            <div style={S.avatarSmall}><ShieldIcon size={30}/></div>
            <div style={S.aiBubble}><TypingDots/></div>
          </div>
        )}
        <div ref={bottomRef}/>
      </diconst S = {
  page:{minHeight:"100vh",background:"#f4f4f4",display:"flex",alignItems:"center",justifyContent:"center",flexDirection:"column",position:"relative",padding:20,fontFamily:"Georgia,serif"},
  stripTop:{position:"fixed",top:0,left:0,right:0,height:8,background:"#1a1a1a",zIndex:99},
  stripRed:{position:"fixed",top:8,left:0,right:0,height:6,background:"#BB0000",zIndex:99},
  stripBottom:{position:"fixed",bottom:0,left:0,right:0,height:8,background:"#006600",zIndex:99},
  homeCard:{background:"#fff",borderRadius:20,padding:"36px 28px",maxWidth:420,width:"100%",boxShadow:"0 8px 40px rgba(0,102,0,0.15)",border:"3px solid #006600",textAlign:"center",marginTop:20},
  logo:{fontSize:32,fontWeight:900,color:"#006600",margin:0,fontFamily:"Georgia,serif"},
  tagline:{fontSize:15,color:"#BB0000",fontWeight:700,margin:"4px 0 8px"},
  v2Badge:{background:"linear-gradient(135deg,#1a1a1a,#006600)",color:"#c8960c",fontSize:12,fontWeight:800,padding:"4px 14px",borderRadius:20,display:"inline-block",marginBottom:10},
  subtitle:{fontSize:15,color:"#444",lineHeight:1.6,margin:"0 0 16px"},
  featureGrid:{display:"flex",flexWrap:"wrap",gap:8,justifyContent:"center",marginBottom:16},
  featureChip:{background:"#e8f5e9",border:"1.5px solid #006600",borderRadius:20,padding:"5px 13px",fontSize:13,color:"#006600",fontWeight:600},
  v2Features:{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8,marginBottom:14},
  v2Card:{background:"#e8f5e9",border:"2px solid #006600",borderRadius:12,padding:"10px 6px",display:"flex",flexDirection:"column",alignItems:"center",gap:3,textAlign:"center"},
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
  chatHeader:{background:"linear-gradient(135deg,#1a1a1a 0%,#006600 100%)",padding:"12px 16px",display:"flex",alignItems:"center",justifyContent:"space-between",boxShadow:"0 2px 12px rgba(0,0,0,0.3)"},
  backWhite:{background:"none",border:"none",color:"#fff",fontSize:22,cursor:"pointer",fontWeight:700},
  newChat:{background:"#BB0000",border:"none",color:"#fff",borderRadius:8,padding:"6px 12px",fontSize:12,fontWeight:700,cursor:"pointer"},
  modeTabs:{display:"flex",background:"#fff",borderBottom:"2px solid #006600"},
  modeTab:{flex:1,padding:"9px 2px",border:"none",background:"none",fontSize:11,fontWeight:700,cursor:"pointer",color:"#888",fontFamily:"Georgia,serif"},
  modeTabActive:{color:"#006600",borderBottom:"3px solid #006600",background:"#e8f5e9"},
  panel:{background:"#fff",padding:"14px",borderBottom:"1px solid #eee"},
  panelTitle:{textAlign:"center",fontWeight:900,color:"#006600",marginBottom:4,fontSize:14,fontFamily:"Georgia,serif"},
  panelSub:{textAlign:"center",fontSize:11,color:"#666",marginBottom:10},
  btnGrid:{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8,marginBottom:10},
  mediaBtn:{padding:"10px 6px",borderRadius:10,border:"2px solid #006600",background:"#e8f5e9",color:"#006600",fontWeight:700,fontSize:12,cursor:"pointer",fontFamily:"Georgia,serif"},
  researchInput:{width:"100%",padding:"10px 14px",borderRadius:12,border:"2px solid #006600",fontSize:13,fontFamily:"Georgia,serif",background:"#e8f5e9",outline:"none",resize:"none"},
  warning:{fontSize:11,color:"#BB0000",textAlign:"center",marginTop:8,fontWeight:700},
  chatBody:{flex:1,overflowY:"auto",padding:"16px 12px",display:"flex",flexDirection:"column"},
  avatarSmall:{width:34,height:34,marginRight:8,flexShrink:0,marginTop:4},
  aiBubble:{background:"#fff",borderRadius:"4px 18px 18px 18px",padding:"10px 14px",maxWidth:"80%",fontSize:14,lineHeight:1.6,boxShadow:"0 2px 8px rgba(0,0,0,0.08)",color:"#1a1a1a",border:"1.5px solid #006600"},
  userBubble:{background:"linear-gradient(135deg,#006600,#009900)",color:"#fff",borderRadius:"18px 4px 18px 18px",padding:"10px 14px",maxWidth:"78%",fontSize:14,lineHeight:1.6},
  quickRow:{display:"flex",gap:8,padding:"8px 12px",overflowX:"auto",background:"#fff",borderTop:"1px solid #eee"},
  quickBtn:{whiteSpace:"nowrap",padding:"8px 12px",borderRadius:20,border:"2px solid #BB0000",background:"#fff0f0",color:"#BB0000",fontSize:12,fontWeight:700,cursor:"pointer",fontFamily:"Georgia,serif"},
  inputRow:{display:"flex",gap:8,padding:"10px 12px 18px",background:"#fff",borderTop:"2px solid #006600"},
  input:{flex:1,padding:"12px 16px",borderRadius:24,border:"2px solid #006600",fontSize:15,outline:"none",fontFamily:"Georgia,serif",background:"#e8f5e9"},
  sendBtn:{background:"#BB0000",color:"#fff",border:"none",borderRadius:"50%",width:48,height:48,fontSize:20,cursor:"pointer",fontWeight:700},
};v>
      {displayMessages.length<=1&&mode==="chat"&&(
        <div style={S.quickRow}>
          {quickActions.map(a=>(<button key={a.label} style={S.quickBtn} onClick={()=>sendMessage(a.text)}>{a.label}</button>))}
        </div>
      )}
      {mode==="chat"&&(
        <div style={S.inputRow}>
          <input style={S.input} value={input} onChange={e=>setInput(e.target.value)}
            onKeyDown={e=>e.key==="Enter"&&sendMessage(input)}
            placeholder="Ask your education question... 📚"/>
          <button style={S.sendBtn} onClick={()=>sendMessage(input)} disabled={loading||!input.trim()}>➤</button>
        </div>
      )}
    </div>
  );
}

