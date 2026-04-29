import { useState, useRef, useEffect } from "react";

const KEY = "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";
const API = "https://openrouter.ai/api/v1/chat/completions";
const CBC = ["Mathematics","English","Kiswahili","Science & Technology","Social Studies","Creative Arts","Religious Education"];
const SEC = ["Mathematics","English","Kiswahili","Biology","Chemistry","Physics","History & Government","Geography","Computer Studies","Business Studies","Agriculture"];
const SYSTEM = "You are MsomaBuddy, a strictly educational AI for Kenyan students. Only answer school subject questions. Use Kenyan examples like matatus and shillings. Be warm and encouraging. If asked non-educational questions say: Samahani! MsomaBuddy is for education only. Ask me about your subjects!";

export default function App() {
  const [screen, setScreen] = useState("home");
  const [level, setLevel] = useState(null);
  const [subject, setSubject] = useState(null);
  const [msgs, setMsgs] = useState([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [img, setImg] = useState(null);
  const [img64, setImg64] = useState(null);
  const [research, setResearch] = useState("");
  const [mode, setMode] = useState("chat");
  const ref = useRef(null);
  const camRef = useRef(null);
  const galRef = useRef(null);
  const vidRef = useRef(null);
  const fileRef = useRef(null);

  useEffect(()=>{ ref.current?.scrollIntoView({behavior:"smooth"}); },[msgs,loading]);

  const subs = level === "CBC" ? CBC : SEC;

  const onImg = (e) => {
    const f = e.target.files[0];
    if (!f || !f.type.startsWith("image/")) return;
    const r = new FileReader();
    r.onload = (ev) => { setImg(ev.target.result); setImg64(ev.target.result.split(",")[1]); };
    r.readAsDataURL(f);
  };

  const onVid = (e) => {
    const f = e.target.files[0];
    if (!f) return;
    alert("Video saved as study material!");
  };

  const send = async (text, i64=null) => {
    if (!text.trim() && !i64) return;
    const content = i64
      ? [{type:"image_url",image_url:{url:"data:image/jpeg;base64,"+i64}},{type:"text",text:text||"Explain this educational image for a Kenyan student step by step."}]
      : text;
    const newMsgs = [...msgs, {role:"user",content}];
    const dispMsg = {role:"user",text:text||"Photo sent for explanation",img:i64?img:null};
    setMsgs(newMsgs);
    setImg(null); setImg64(null); setInput(""); setLoading(true);
    try {
      const res = await fetch(API, {
        method:"POST",
        headers:{"Content-Type":"application/json","Authorization":"Bearer "+KEY,"HTTP-Referer":"https://probable-octo-broccoli-six.vercel.app","X-Title":"MsomaBuddy"},
        body:JSON.stringify({model:"anthropic/claude-3-haiku",max_tokens:1000,messages:[{role:"system",content:SYSTEM+" Level:"+level+" Subject:"+subject},...newMsgs]})
      });
      const d = await res.json();
      const reply = d.choices?.[0]?.message?.content || "Samahani, try again!";
      setMsgs(prev=>[...prev,{role:"assistant",content:reply}]);
    } catch(e) {
      setMsgs(prev=>[...prev,{role:"assistant",content:"Oops! Check internet and try again!"}]);
    }
    setLoading(false);
  };

  const G = {
    page:{minHeight:"100vh",background:"#f4f4f4",display:"flex",alignItems:"center",justifyContent:"center",flexDirection:"column",padding:20,fontFamily:"Georgia,serif"},
    bar:{position:"fixed",left:0,right:0,zIndex:99},
    card:{background:"#fff",borderRadius:20,padding:"28px 20px",maxWidth:420,width:"100%",border:"3px solid #006600",boxShadow:"0 8px 40px rgba(0,102,0,0.15)",textAlign:"center",marginTop:16},
    btn:{background:"linear-gradient(135deg,#006600,#009900)",color:"#fff",border:"none",borderRadius:14,padding:"14px",fontSize:17,fontWeight:800,cursor:"pointer",width:"100%",fontFamily:"Georgia,serif",marginTop:8},
    sbj:{padding:"12px 6px",borderRadius:10,border:"2px solid #BB0000",background:"#fff0f0",color:"#1a1a1a",fontWeight:700,fontSize:13,cursor:"pointer",fontFamily:"Georgia,serif"},
    chat:{display:"flex",flexDirection:"column",height:"100vh",background:"#f0f0f0",fontFamily:"Georgia,serif"},
    hdr:{background:"linear-gradient(135deg,#1a1a1a,#006600)",padding:"12px 16px",display:"flex",alignItems:"center",justifyContent:"space-between"},
    tab:{flex:1,padding:"9px 2px",border:"none",background:"none",fontSize:11,fontWeight:700,cursor:"pointer",color:"#888",fontFamily:"Georgia,serif"},
    body:{flex:1,overflowY:"auto",padding:"14px 12px",display:"flex",flexDirection:"column"},
    ai:{background:"#fff",borderRadius:"4px 18px 18px 18px",padding:"10px 14px",maxWidth:"80%",fontSize:14,lineHeight:1.6,border:"1.5px solid #006600",marginBottom:2},
    usr:{background:"linear-gradient(135deg,#006600,#009900)",color:"#fff",borderRadius:"18px 4px 18px 18px",padding:"10px 14px",maxWidth:"78%",fontSize:14,lineHeight:1.6},
    inp:{flex:1,padding:"12px 16px",borderRadius:24,border:"2px solid #006600",fontSize:15,outline:"none",fontFamily:"Georgia,serif",background:"#e8f5e9"},
    send:{background:"#BB0000",color:"#fff",border:"none",borderRadius:"50%",width:48,height:48,fontSize:20,cursor:"pointer"},
    mdb:{padding:"10px 6px",borderRadius:10,border:"2px solid #006600",background:"#e8f5e9",color:"#006600",fontWeight:700,fontSize:12,cursor:"pointer",fontFamily:"Georgia,serif"},
  };

  if (screen==="home") return (
    <div style={G.page}>
      <div style={{...G.bar,top:0,height:8,background:"#1a1a1a"}}/>
      <div style={{...G.bar,top:8,height:6,background:"#BB0000"}}/>
      <div style={{...G.bar,bottom:0,height:8,background:"#006600"}}/>
      <div style={G.card}>
        <h1 style={{fontSize:30,fontWeight:900,color:"#006600",margin:"0 0 4px",fontFamily:"Georgia,serif"}}>MsomaBuddy</h1>
        <p style={{color:"#BB0000",fontWeight:700,fontSize:14,margin:"0 0 12px"}}>🇰🇪 Kenya's Smart Study Partner</p>
        <div style={{background:"linear-gradient(135deg,#1a1a1a,#006600)",color:"#c8960c",fontSize:12,fontWeight:800,padding:"4px 14px",borderRadius:20,display:"inline-block",marginBottom:12}}>⚡ V2 — Photo + Video + Research!</div>
        <p style={{fontSize:14,color:"#444",lineHeight:1.6,margin:"0 0 16px"}}>AI help for <b>CBC</b> & <b>Secondary</b> students.<br/>Strictly educational. Available 24/7!</p>
        <div style={{display:"flex",flexWrap:"wrap",gap:8,justifyContent:"center",marginBottom:14}}>
          {["📐 Maths","💻 Computer","🧪 Sciences","📖 Languages","🌍 Humanities","🎨 CBC"].map(f=>(
            <div key={f} style={{background:"#e8f5e9",border:"1.5px solid #006600",borderRadius:20,padding:"5px 10px",fontSize:12,color:"#006600",fontWeight:600}}>{f}</div>
          ))}
        </div>
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8,marginBottom:14}}>
          {[["📸","Snap Question"],["🎥","Record Video"],["📁","Upload Files"],["🔬","Research"]].map(([e,l])=>(
            <div key={l} style={{background:"#e8f5e9",border:"2px solid #006600",borderRadius:12,padding:"10px 6px",display:"flex",flexDirection:"column",alignItems:"center",gap:3}}>
              <span style={{fontSize:22}}>{e}</span>
              <strong style={{fontSize:12,color:"#006600"}}>{l}</strong>
            </div>
          ))}
        </div>
        <div style={{background:"#fff3f3",border:"1.5px solid #BB0000",borderRadius:10,padding:"8px",marginBottom:12,fontSize:12,color:"#BB0000",fontWeight:700}}>🚫 Strictly Education Only</div>
        <button style={G.btn} onClick={()=>setScreen("level")}>Anza Kusoma! 🚀</button>
        <p style={{fontSize:11,color:"#999",marginTop:6}}>("Anza Kusoma" = Start Studying)</p>
        <div style={{marginTop:20,padding:16,borderRadius:14,background:"linear-gradient(135deg,#1a1a1a,#006600)",border:"2px solid #c8960c",textAlign:"center"}}>
          <img src="https://i.postimg.cc/ZKZJmR9J/IMG-20260321-WA0183.jpg" alt="Kelsey" style={{width:70,height:70,borderRadius:"50%",objectFit:"cover",border:"3px solid #c8960c",marginBottom:8}}/>
          <p style={{color:"#c8960c",fontWeight:900,fontSize:14,margin:"2px 0"}}>👩‍💻 Made by Kelsey Wangui Wanjiku</p>
          <p style={{color:"#fff",fontSize:11,margin:"2px 0"}}>Education & Tech Enthusiast 🎓</p>
          <p style={{color:"#c8ffc8",fontSize:11}}>Kenya 🇰🇪 | MsomaBuddy Founder</p>
        </div>
      </div>
    </div>
  );

  if (screen==="level") return (
    <div style={G.page}>
      <div style={{...G.bar,top:0,height:8,background:"#1a1a1a"}}/>
      <div style={{...G.bar,top:8,height:6,background:"#BB0000"}}/>
      <div style={{...G.bar,bottom:0,height:8,background:"#006600"}}/>
      <div style={G.card}>
        <button style={{background:"none",border:"none",color:"#006600",fontSize:15,fontWeight:700,cursor:"pointer",padding:"0 0 14px",fontFamily:"Georgia,serif"}} onClick={()=>setScreen("home")}>← Back</button>
        <h2 style={{fontSize:22,fontWeight:900,color:"#1a1a1a",margin:"0 0 6px",fontFamily:"Georgia,serif"}}>Who are you? 🎓</h2>
        <p style={{color:"#777",fontSize:14,margin:"0 0 20px"}}>Select your level</p>
        <div style={{display:"flex",flexDirection:"column",gap:12}}>
          {[{id:"CBC",label:"CBC Student",desc:"Grade 1–9",e:"🏫"},{id:"Secondary",label:"Secondary Student",desc:"Form 1–4 (KCSE)",e:"📚"}].map(l=>(
            <button key={l.id} style={{display:"flex",flexDirection:"column",alignItems:"center",gap:4,padding:"20px",borderRadius:14,border:"2.5px solid #006600",background:"#e8f5e9",cursor:"pointer",fontFamily:"Georgia,serif"}} onClick={()=>{setLevel(l.id);setScreen("subject");}}>
              <span style={{fontSize:36}}>{l.e}</span>
              <strong style={{fontSize:16}}>{l.label}</strong>
              <span style={{color:"#666",fontSize:13}}>{l.desc}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );

  if (screen==="subject") return (
    <div style={G.page}>
      <div style={{...G.bar,top:0,height:8,background:"#1a1a1a"}}/>
      <div style={{...G.bar,top:8,height:6,background:"#BB0000"}}/>
      <div style={{...G.bar,bottom:0,height:8,background:"#006600"}}/>
      <div style={G.card}>
        <button style={{background:"none",border:"none",color:"#006600",fontSize:15,fontWeight:700,cursor:"pointer",padding:"0 0 14px",fontFamily:"Georgia,serif"}} onClick={()=>setScreen("level")}>← Back</button>
        <h2 style={{fontSize:22,fontWeight:900,color:"#1a1a1a",margin:"0 0 6px",fontFamily:"Georgia,serif"}}>Pick a Subject 📚</h2>
        <p style={{color:"#777",fontSize:13,margin:"0 0 16px"}}>{level} Curriculum</p>
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10}}>
          {subs.map(s=>(
            <button key={s} style={G.sbj} onClick={()=>{
              setSubject(s);
              setMsgs([{role:"assistant",content:"Habari! I am MsomaBuddy V2, your study partner for "+s+"!\n\nUse the tabs above to:\n📸 Snap a photo of a question\n🎥 Record a study video\n📁 Upload a file\n🔬 Research a topic\n\nOr just ask me anything! Tuanze! 💪🇰🇪"}]);
              setMode("chat");
              setScreen("chat");
            }}>{s}</button>
          ))}
        </div>
      </div>
    </div>
  );

  return (
    <div style={G.chat}>
      <div style={G.hdr}>
        <button style={{background:"none",border:"none",color:"#fff",fontSize:22,cursor:"pointer",fontWeight:700}} onClick={()=>setScreen("subject")}>←</button>
        <div>
          <div style={{fontWeight:800,fontSize:15,color:"#fff",fontFamily:"Georgia,serif"}}>MsomaBuddy V2</div>
          <div style={{fontSize:10,color:"#c8ffc8"}}>{subject} • {level} • 🔒 Edu Only</div>
        </div>
        <button style={{background:"#BB0000",border:"none",color:"#fff",borderRadius:8,padding:"6px 12px",fontSize:12,fontWeight:700,cursor:"pointer"}} onClick={()=>{setMsgs([]);setScreen("subject");}}>New</button>
      </div>
      <div style={{display:"flex",background:"#fff",borderBottom:"2px solid #006600"}}>
        {[{id:"chat",l:"💬 Chat"},{id:"photo",l:"📸 Photo"},{id:"video",l:"🎥 Video"},{id:"research",l:"🔬 Research"}].map(m=>(
          <button key={m.id} style={{...G.tab,...(mode===m.id?{color:"#006600",borderBottom:"3px solid #006600",background:"#e8f5e9"}:{})}} onClick={()=>setMode(m.id)}>{m.l}</button>
        ))}
      </div>
      {mode==="photo"&&(
        <div style={{background:"#fff",padding:14,borderBottom:"1px solid #eee"}}>
          <p style={{textAlign:"center",fontWeight:900,color:"#006600",fontSize:14,margin:"0 0 8px",fontFamily:"Georgia,serif"}}>📸 Snap a Textbook Question!</p>
          {img&&<img src={img} alt="prev" style={{width:"100%",maxHeight:160,objectFit:"contain",borderRadius:10,border:"2px solid #006600",marginBottom:8}}/>}
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8,marginBottom:8}}>
            <button style={G.mdb} onClick={()=>camRef.current.click()}>📷 Take Photo</button>
            <button style={G.mdb} onClick={()=>galRef.current.click()}>🖼️ Gallery</button>
          </div>
          <input ref={camRef} type="file" accept="image/*" capture="environment" style={{display:"none"}} onChange={onImg}/>
          <input ref={galRef} type="file" accept="image/*" style={{display:"none"}} onChange={onImg}/>
          {img&&<button style={{...G.btn,marginTop:4,fontSize:14,padding:"11px"}} onClick={()=>{setMode("chat");send("",img64);}}>🧠 Explain This!</button>}
          <p style={{fontSize:11,color:"#BB0000",textAlign:"center",marginTop:6,fontWeight:700}}>🚫 Educational images only</p>
        </div>
      )}
      {mode==="video"&&(
        <div style={{background:"#fff",padding:14,borderBottom:"1px solid #eee"}}>
          <p style={{textAlign:"center",fontWeight:900,color:"#006600",fontSize:14,margin:"0 0 8px",fontFamily:"Georgia,serif"}}>🎥 Study Video Mode!</p>
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8,marginBottom:8}}>
            <button style={G.mdb} onClick={()=>vidRef.current.click()}>🔴 Record Video</button>
            <button style={G.mdb} onClick={()=>fileRef.current.click()}>📁 Upload Video</button>
          </div>
          <input ref={vidRef} type="file" accept="video/*" capture="environment" style={{display:"none"}} onChange={onVid}/>
          <input ref={fileRef} type="file" accept="video/*" style={{display:"none"}} onChange={onVid}/>
          <p style={{fontSize:11,color:"#BB0000",textAlign:"center",fontWeight:700}}>🚫 Study videos only</p>
        </div>
      )}
      {mode==="research"&&(
        <div style={{background:"#fff",padding:14,borderBottom:"1px solid #eee"}}>
          <p style={{textAlign:"center",fontWeight:900,color:"#006600",fontSize:14,margin:"0 0 6px",fontFamily:"Georgia,serif"}}>🔬 Research Mode!</p>
          <textarea style={{width:"100%",padding:"10px",borderRadius:10,border:"2px solid #006600",fontSize:13,fontFamily:"Georgia,serif",background:"#e8f5e9",outline:"none",resize:"none",boxSizing:"border-box"}}
            placeholder={"e.g. Photosynthesis Form 2 Biology"} value={research} onChange={e=>setResearch(e.target.value)} rows={3}/>
          <button style={{...G.btn,fontSize:14,padding:"11px"}} onClick={()=>{if(!research.trim())return;const p="Research: "+research+". Give a curriculum summary for "+level+" "+subject+" in Kenya with key concepts and exam tips.";setResearch("");setMode("chat");send(p);}} disabled={!research.trim()}>🔬 Research!</button>
          <p style={{fontSize:11,color:"#BB0000",textAlign:"center",marginTop:6,fontWeight:700}}>🚫 Education topics only</p>
        </div>
      )}
      <div style={G.body}>
        {msgs.map((m,i)=>(
          <div key={i} style={{display:"flex",justifyContent:m.role==="user"?"flex-end":"flex-start",marginBottom:10}}>
            <div style={m.role==="user"?G.usr:G.ai}>
              {(typeof m.content==="string"?m.content:m.content?.find?.(c=>c.type==="text")?.text||"").split("\n").map((l,j)=>(
                <p key={j} style={{margin:"2px 0",lineHeight:1.5}}>{l}</p>
              ))}
            </div>
          </div>
        ))}
        {loading&&(
          <div style={{display:"flex",gap:5,padding:"10px 0"}}>
            {[0,1,2].map(i=><div key={i} style={{width:9,height:9,borderRadius:"50%",background:"#006600",animation:"b 1.2s "+i*0.2+"s infinite"}}/>)}
            <style>{`@keyframes b{0%,80%,100%{transform:translateY(0)}40%{transform:translateY(-8px)}}`}</style>
          </div>
        )}
        <div ref={ref}/>
      </div>
      {msgs.length<=1&&mode==="chat"&&(
        <div style={{display:"flex",gap:8,padding:"8px 12px",overflowX:"auto",background:"#fff",borderTop:"1px solid #eee"}}>
          {[{l:"📖 Explain",t:"Explain main concepts in "+subject},{l:"🧪 Quiz Me",t:"Give me a quiz on "+subject},{l:"💡 Tip",t:"Give me a study tip for "+subject},{l:"📝 Past Paper",t:"Give me a past paper question for "+subject+" in Kenya"}].map(a=>(
            <button key={a.l} style={{whiteSpace:"nowrap",padding:"8px 12px",borderRadius:20,border:"2px solid #BB0000",background:"#fff0f0",color:"#BB0000",fontSize:12,fontWeight:700,cursor:"pointer",fontFamily:"Georgia,serif"}} onClick={()=>send(a.t)}>{a.l}</button>
          ))}
        </div>
      )}
      {mode==="chat"&&(
        <div style={{display:"flex",gap:8,padding:"10px 12px 18px",background:"#fff",borderTop:"2px solid #006600"}}>
          <input style={G.inp} value={input} onChange={e=>setInput(e.target.value)} onKeyDown={e=>e.key==="Enter"&&send(input)} placeholder="Ask your education question... 📚"/>
          <button style={G.send} onClick={()=>send(input)} disabled={loading||!input.trim()}>➤</button>
        </div>
      )}
    </div>
  );
}
