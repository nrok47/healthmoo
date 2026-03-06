import { useState, useEffect, useRef } from "react";

const GOLD = "#C9A84C"; const DARK = "#1a0a2e"; const RED = "#c0392b";
const YELLOW = "#f39c12"; const GREEN = "#27ae60"; const PURPLE = "#8e44ad";

// ── Zodiac ──
const ZODIAC = [
  {name:"มังกร",emoji:"🐊",dates:[[1,1],[1,19]],element:"ดิน",trait:"มั่นคง ขยัน"},
  {name:"กุมภ์",emoji:"🏺",dates:[[1,20],[2,18]],element:"ลม",trait:"สร้างสรรค์ คิดนอกกรอบ"},
  {name:"มีน",emoji:"🐟",dates:[[2,19],[3,20]],element:"น้ำ",trait:"อ่อนโยน เห็นอกเห็นใจ"},
  {name:"เมษ",emoji:"🐏",dates:[[3,21],[4,19]],element:"ไฟ",trait:"กล้าหาญ มีพลัง"},
  {name:"พฤษภ",emoji:"🐂",dates:[[4,20],[5,20]],element:"ดิน",trait:"อดทน น่าเชื่อถือ"},
  {name:"เมถุน",emoji:"👯",dates:[[5,21],[6,20]],element:"ลม",trait:"ปรับตัวเก่ง สื่อสารดี"},
  {name:"กรกฎ",emoji:"🦀",dates:[[6,21],[7,22]],element:"น้ำ",trait:"ดูแลคนอื่น อ่อนไหว"},
  {name:"สิงห์",emoji:"🦁",dates:[[7,23],[8,22]],element:"ไฟ",trait:"มีเสน่ห์ เป็นผู้นำ"},
  {name:"กันย์",emoji:"🌾",dates:[[8,23],[9,22]],element:"ดิน",trait:"ละเอียด วิเคราะห์เก่ง"},
  {name:"ตุลย์",emoji:"⚖️",dates:[[9,23],[10,22]],element:"ลม",trait:"รักความยุติธรรม"},
  {name:"พิจิก",emoji:"🦂",dates:[[10,23],[11,21]],element:"น้ำ",trait:"หนักแน่น ลึกซึ้ง"},
  {name:"ธนู",emoji:"🏹",dates:[[11,22],[12,21]],element:"ไฟ",trait:"ผจญภัย มองโลกกว้าง"},
  {name:"มังกร",emoji:"🐊",dates:[[12,22],[12,31]],element:"ดิน",trait:"มั่นคง ขยัน"},
];
const DAY_COLORS = ["อาทิตย์","จันทร์","อังคาร","พุธ","พฤหัส","ศุกร์","เสาร์"];
const DAY_HEALTH = [
  "ระวังสุขภาพหัวใจและสายตา","ระวังระบบย่อยอาหาร",
  "ระวังโลหิตและกล้ามเนื้อ","ระวังระบบประสาทและความเครียด",
  "ระวังตับและระบบไหลเวียน","ระวังไตและฮอร์โมน","ระวังกระดูกและข้อต่อ"
];

function getZodiac(d,m){
  for(const z of ZODIAC){
    const [m1,d1]=z.dates[0],[m2,d2]=z.dates[1];
    if((m===m1&&d>=d1)||(m===m2&&d<=d2)) return z;
  }
  return ZODIAC[0];
}
function getBMIStatus(bmi){
  if(bmi<18.5) return {label:"ผอมเกินเกณฑ์",color:YELLOW,merit:-1,tip:"เสริมโปรตีนและออกกำลังกายสร้างกล้ามเนื้อ"};
  if(bmi<23)   return {label:"น้ำหนักดี",color:GREEN,merit:2,tip:"รักษาน้ำหนักดีนี้ไว้ คือบุญแห่งสุขภาพ"};
  if(bmi<25)   return {label:"น้ำหนักเกินเล็กน้อย",color:YELLOW,merit:0,tip:"ระวังน้ำหนักขึ้นอีก ลดแป้ง-น้ำตาล"};
  if(bmi<30)   return {label:"อ้วน",color:RED,merit:-2,tip:"ลดน้ำหนักด่วน เสี่ยงเบาหวาน ความดัน"};
  return {label:"อ้วนมาก",color:RED,merit:-3,tip:"ควรพบแพทย์เพื่อวางแผนลดน้ำหนักโดยด่วน"};
}

// ── Questions by PART ──
const PARTS = [
  { id:"body", label:"PART 1 | ร่างกาย", title:"ตรวจดวงชะตาสังขาร", icon:"🔥", questions:[
    {id:"sleep",q:"ดวงการพักผ่อน — คุณนอนหลับกี่ชั่วโมงต่อคืน?",opts:[
      {t:"น้อยกว่า 5 ชม.",sin:3},{t:"5–6 ชม.",sin:1},{t:"7–8 ชม.",merit:2},{t:"มากกว่า 8 ชม.",merit:1}]},
    {id:"exercise",q:"ดวงพลังกาย — คุณออกกำลังกายบ่อยแค่ไหน?",opts:[
      {t:"แทบไม่ออกเลย",sin:3},{t:"นานๆ ครั้ง",sin:1},{t:"1–2 ครั้ง/สัปดาห์",merit:1},{t:"3+ ครั้ง/สัปดาห์",merit:2}]},
    {id:"substance",q:"ดวงสิ่งเสพติด — เหล้า บุหรี่ ในชีวิตคุณ?",opts:[
      {t:"ใช้ทุกวัน",sin:3},{t:"ใช้บางครั้ง",sin:2},{t:"เลิกได้แล้ว",merit:1},{t:"ไม่ใช้เลย",merit:2}]},
  ]},
  { id:"mind", label:"PART 2 | จิตใจ", title:"เปิดไพ่ดวงจิต", icon:"🌙", questions:[
    {id:"stress",q:"ดวงความเครียด — ระดับความกดดันในชีวิตตอนนี้?",opts:[
      {t:"เครียดหนักมาก",sin:3},{t:"เครียดพอสมควร",sin:1},{t:"รับมือได้",merit:1},{t:"ผ่อนคลายดี",merit:2}]},
    {id:"social",q:"ดวงมิตรภาพ — คุณมีกัลยาณมิตรคอยสนับสนุนไหม?",opts:[
      {t:"โดดเดี่ยวมาก",sin:3},{t:"มีสังคมน้อย",sin:1},{t:"มีเพื่อนพอสมควร",merit:1},{t:"มีกัลยาณมิตรดีมาก",merit:2}]},
    {id:"screen",q:"ดวงแสงสีฟ้า — ใช้หน้าจอก่อนนอนนานแค่ไหน?",opts:[
      {t:"2+ ชม. ทุกคืน",sin:2},{t:"1–2 ชม.",sin:1},{t:"ไม่ถึง 30 นาที",merit:1},{t:"ไม่ใช้เลย",merit:2}]},
  ]},
  { id:"wisdom", label:"PART 3 | ปัญญา", title:"ดวงลายมือแห่งปัญญา", icon:"🧠", questions:[
    {id:"diet",q:"ดวงอาหาร — พฤติกรรมการกินของคุณเป็นอย่างไร?",opts:[
      {t:"กินขยะ/หวาน/แปรรูปทุกวัน",sin:3},{t:"กินผักนานๆ ครั้ง",sin:1},{t:"พยายามกินผักบ้าง",merit:1},{t:"กินสะอาดสมดุล",merit:2}]},
    {id:"prevention",q:"ดวงการป้องกัน — คุณตรวจสุขภาพสม่ำเสมอไหม?",opts:[
      {t:"ไม่เคยตรวจเลย",sin:3},{t:"ตรวจบางปี",sin:1},{t:"ตรวจทุกปี",merit:1},{t:"ตรวจและมีแผนส่วนตัว",merit:2}]},
  ]},
  { id:"society", label:"PART 4 | สังคม", title:"ลางร้าย-ลางดีชะตา", icon:"🌺", questions:[
    {id:"mobility",q:"ดวงอิสรภาพกาย — ท่านเดินจาริกได้ด้วยตนเองไหม?",opts:[
      {t:"เดินลำบาก ต้องพึ่งคนอื่น",sin:3},{t:"เดินได้แต่เมื่อยง่าย",sin:1},{t:"เดินดีแต่ไม่ได้บริหาร",merit:1},{t:"บริหารร่างกายสม่ำเสมอ",merit:2}]},
    {id:"economy",q:"ดวงการเงิน-สุขภาพ — ค่าใช้จ่ายด้านสุขภาพของคุณ?",opts:[
      {t:"หนักมาก เป็นหนี้เพราะป่วย",sin:3},{t:"มีบ้าง แต่พอจัดการได้",sin:1},{t:"น้อย เพราะดูแลตัวเองดี",merit:1},{t:"แทบไม่มี มีสุขภาพดีมาก",merit:2}]},
  ]},
];

// ── Prediction texts ──
const PREDICTIONS = {
  body:{
    low:"⚠️ ดวงสุขภาพกายอ่อนแอ เจ้ากรรมนายเวรมาในรูปความเกียจคร้านและสิ่งเสพติด ควรสะเดาะเคราะห์ด้วยการตื่นนอนก่อน 6 โมงเช้า เดินวันละ 30 นาที และงดเหล้า-บุหรี่",
    mid:"🌤 ดวงกายพอใช้ได้ แต่ยังมีจุดอ่อนให้แก้ไข เสริมดวงด้วยการนอนให้ครบ 7-8 ชั่วโมง และออกกำลังกายให้สม่ำเสมอ ก็จะเปิดทางบุญแห่งสุขภาพ",
    high:"✨ ดวงกายแข็งแกร่ง สังขารของท่านเป็นวิหารที่ดูแลดี ขอให้รักษาวินัยนี้ไว้ เพราะบุญสุขภาพที่สั่งสมมาจะคุ้มครองท่านในยามชรา",
  },
  mind:{
    low:"⚠️ ดวงจิตอ่อนล้า มีเกณฑ์ความเครียดสะสมกัดกินใจ ควรหากัลยาณมิตรพูดคุย หรือฝึกสมาธิ 5 นาทีต่อวัน เพื่อชำระล้างกรรมเก่าแห่งความเครียด",
    mid:"🌤 ดวงจิตทรงตัว มีทั้งแรงบวกและแรงลบ ต้องระวังความเครียดสะสม แนะนำให้วางมือถือก่อนนอน เพื่อให้จิตได้พักอย่างแท้จริง",
    high:"✨ ดวงจิตผ่องใส มีกัลยาณมิตรและสมดุลทางอารมณ์ที่ดี นี่คือทุนสุขภาวะที่ล้ำค่ากว่าทรัพย์สินใดๆ จงรักษาไว้",
  },
  wisdom:{
    low:"⚠️ ดวงปัญญาต่อสุขภาพยังต้องพัฒนา ยังติดกับดักอาหารทำลายสุขภาพและละเลยการตรวจร่างกาย ควรเริ่มตรวจสุขภาพปีนี้และลดของหวาน-ของมัน",
    mid:"🌤 ดวงปัญญาพอเข้าใจสุขภาพ แต่ยังทำได้ไม่สม่ำเสมอ แนะนำให้วางแผน Individual Health Plan เพื่อปิดช่องโหว่",
    high:"✨ ดวงปัญญาสุขภาพเยี่ยมยอด ท่านรู้จักดูแลตัวเองทั้งอาหารและการตรวจร่างกาย นี่คือเกราะป้องกันโรคNCDที่แข็งแกร่งที่สุด",
  },
  society:{
    low:"⚠️ ดวงสังคม-การเงินสุขภาพอ่อนแอ มีเกณฑ์แบกภาระหนี้จากโรคภัย ควรติดต่อ ศอ.10 เพื่อรับคำปรึกษาฟรี ก่อนที่ภาระจะหนักเกินไป",
    mid:"🌤 ดวงสังคมพอไหว แต่ยังมีความเสี่ยงทางร่างกายและการเงินที่ต้องระวัง แนะนำให้ใช้สิทธิ์บัตรทองตรวจสุขภาพป้องกันก่อนเจ็บป่วย",
    high:"✨ ดวงสังคม-การเงินสุขภาพดีเยี่ยม ท่านเป็นแบบอย่างที่ดูแลกายและการเงินได้พร้อมกัน ขอให้ถ่ายทอดความรู้นี้สู่คนรอบข้าง",
  },
};

function getPredLevel(score, max) {
  const p = score / max;
  if (p < 0.4) return "low";
  if (p < 0.7) return "mid";
  return "high";
}

// ── CSS ──
const css = `
  @keyframes float0{0%,100%{transform:translateY(0)}50%{transform:translateY(-16px)}}
  @keyframes float1{0%,100%{transform:translateY(0) rotate(0deg)}50%{transform:translateY(-10px) rotate(180deg)}}
  @keyframes float2{0%,100%{transform:translateY(0)}50%{transform:translateY(-20px)}}
  @keyframes glow{0%,100%{text-shadow:0 0 10px ${GOLD}}50%{text-shadow:0 0 30px ${GOLD},0 0 60px ${GOLD}}}
  @keyframes spin{from{transform:rotate(0deg)}to{transform:rotate(360deg)}}
  @keyframes pulse{0%,100%{transform:scale(1)}50%{transform:scale(1.06)}}
  @keyframes slideUp{from{opacity:0;transform:translateY(28px)}to{opacity:1;transform:translateY(0)}}
  @keyframes fadeIn{from{opacity:0}to{opacity:1}}
  @keyframes shimmer{0%{background-position:-200% center}100%{background-position:200% center}}
  @keyframes orbIn{from{opacity:0;transform:scale(0.5)}to{opacity:1;transform:scale(1)}}
  @keyframes ripple{0%{transform:scale(1);opacity:.5}100%{transform:scale(2);opacity:0}}
  .btn-opt{transition:all .2s ease!important}
  .btn-opt:hover{transform:scale(1.02) translateX(4px)!important;border-color:${GOLD}!important;background:rgba(201,168,76,0.15)!important}
  .btn-opt:active{transform:scale(.96)!important}
  .btn-cta:hover{transform:scale(1.03)!important;filter:brightness(1.15)!important}
  .btn-cta:active{transform:scale(.97)!important}
  .orb{cursor:pointer;transition:all .3s ease}
  .orb:hover{transform:scale(1.12)!important;filter:brightness(1.2)!important}
  input,select,textarea{outline:none;transition:border-color .2s,box-shadow .2s}
  input:focus,select:focus,textarea:focus{border-color:${GOLD}!important;box-shadow:0 0 0 2px ${GOLD}33!important}
  /* responsive typography and spacing */
  body{font-size:16px;line-height:1.5;padding:0;margin:0;}
  @media (max-width:480px){body{font-size:14px;line-height:1.4;}}
  @media (min-width:768px){body{font-size:16px;line-height:1.5;}}
  @media (min-width:1024px){body{font-size:18px;line-height:1.6;}}
  @media (min-width:1440px){body{font-size:20px;line-height:1.6;}}
  
  /* responsive container */
  @media (max-width:480px){.btn-opt,.btn-cta{font-size:0.85rem;padding:0.6rem 1rem;min-height:44px;}}
  @media (min-width:481px) and (max-width:767px){.btn-opt,.btn-cta{font-size:0.95rem;padding:0.7rem 1.2rem;min-height:48px;}}
  @media (min-width:768px) and (max-width:1023px){.btn-opt,.btn-cta{font-size:1rem;padding:0.75rem 1.3rem;min-height:48px;}}
  @media (min-width:1024px){.btn-opt,.btn-cta{font-size:1.1rem;padding:0.8rem 1.4rem;min-height:52px;}}
  
  /* responsive input fields */
  @media (max-width:480px){input,select,textarea{font-size:16px;padding:12px 14px;min-height:44px;}}
  @media (min-width:481px){input,select,textarea{font-size:14px;padding:10px 14px;}}
  
  /* responsive spacing */
  @media (max-width:480px){.page-content{padding:0 12px;}}
  @media (min-width:481px) and (max-width:767px){.page-content{padding:0 16px;}}
  @media (min-width:768px) and (max-width:1023px){.page-content{padding:0 20px;}}
  @media (min-width:1024px){.page-content{padding:0;max-width:100%;}}
  
  /* PC full screen layout */
  @media (min-width:1024px){
    body{margin:0;padding:0;overflow-x:hidden;}
    .page-content{width:100vw;max-width:none;margin:0;padding:0;}
  }
  
  /* touch-friendly hover states */
  @media (hover: hover) and (pointer: fine){
    .btn-opt:hover{transform:scale(1.02) translateX(4px)!important;border-color:${GOLD}!important;background:rgba(201,168,76,0.15)!important}
    .btn-cta:hover{transform:scale(1.03)!important;filter:brightness(1.15)!important}
    .orb:hover{transform:scale(1.12)!important;filter:brightness(1.2)!important}
  }
  @media (hover: none) and (pointer: coarse){
    .btn-opt:active{transform:scale(0.98)!important;background:rgba(201,168,76,0.2)!important}
    .btn-cta:active{transform:scale(0.98)!important}
    .orb:active{transform:scale(0.95)!important}
  }
`;

function useFade(k){const[v,sV]=useState(false);useEffect(()=>{sV(false);const t=setTimeout(()=>sV(true),60);return()=>clearTimeout(t);},[k]);return v;}

function Particles(){return(<><div style={{position:"fixed",inset:0,pointerEvents:"none",overflow:"hidden",zIndex:0}}>{[...Array(16)].map((_,i)=>(<div key={i} style={{position:"absolute",width:i%3===0?6:3,height:i%3===0?6:3,borderRadius:"50%",background:i%4===0?GOLD:"rgba(201,168,76,0.25)",left:`${(i*19+3)%100}%`,top:`${(i*27+7)%100}%`,animation:`float${i%3} ${4+(i%4)}s ease-in-out infinite`,animationDelay:`${i*.35}s`}}/>))}</div><style>{css}</style></>);}

function Page({children,vis}){return(<div className="page-content" style={{opacity:vis?1:0,transform:vis?"translateY(0)":"translateY(22px)",transition:"opacity .5s ease,transform .5s ease",position:"relative",zIndex:1,width:"100%",maxWidth:"min(600px,95vw)",margin:"0 auto",padding:"0 clamp(12px,3vw,20px)",boxSizing:"border-box"}}>{children}</div>);}

const KanokBorder=()=>(<div style={{textAlign:"center",color:GOLD,fontSize:18,letterSpacing:10,userSelect:"none",animation:"glow 3s ease-in-out infinite"}}>❧ ✦ ❧</div>);

const iStyle={width:"100%",background:"rgba(255,255,255,0.05)",border:`1px solid ${GOLD}44`,borderRadius:10,padding:"10px 14px",color:"#f0e6c8",fontSize:14,boxSizing:"border-box"};
const selStyle={...iStyle,appearance:"none",cursor:"pointer"};

export default function HealthMoo(){
  const[step,setStep]=useState("welcome");
  const[partIdx,setPartIdx]=useState(0);
  const[qIdx,setQIdx]=useState(0);
  const[answers,setAnswers]=useState({});
  const[clickedOpt,setClickedOpt]=useState(null);
  const[activeOrb,setActiveOrb]=useState(null);
  // profile
  const[dob,setDob]=useState({d:"",m:"",y:""});
  const[dayOfWeek,setDayOfWeek]=useState("");
  const[weight,setWeight]=useState("");
  const[height,setHeight]=useState("");
  const[dobError,setDobError]=useState("");
  // consent
  const[consented,setConsented]=useState(false);
  const[profile,setProfile]=useState({name:"",age:"",gender:"",feedback:""});
  const[profileSaved,setProfileSaved]=useState(false);
  const[profileError,setProfileError]=useState("");
  const[exported,setExported]=useState(false);
  const yantraRef=useRef(null);
  const vis=useFade(step+partIdx+qIdx);

  // compute
  const bmi = weight&&height ? +(weight/((height/100)**2)).toFixed(1) : null;
  const bmiStatus = bmi ? getBMIStatus(bmi) : null;
  const zodiac = dob.d&&dob.m ? getZodiac(+dob.d,+dob.m) : null;
  const totalMerit=Object.values(answers).reduce((s,a)=>s+(a.merit||0),0)+(bmiStatus?.merit||0);
  const totalSin=Object.values(answers).reduce((s,a)=>s+(a.sin||0),0);
  const allQCount=PARTS.reduce((s,p)=>s+p.questions.length,0);
  const pct=Math.max(0,Math.min(100,Math.round(((totalMerit-totalSin+allQCount*3)/(allQCount*5))*100)));
  const tier=pct>=65?"excellent":pct>=40?"stable":"crisis";
  const tierInfo={
    crisis:{label:"วิกฤต — ยักษ์แดง",color:RED,emoji:"🔴",sub:"สังขารต้องการการรักษาด่วน"},
    stable:{label:"ทรงตัว — มนุษย์",color:YELLOW,emoji:"🟡",sub:"ถึงเวลาปรับสมดุลชีวิต"},
    excellent:{label:"มั่งคั่ง — เทวดา",color:GREEN,emoji:"🟢",sub:"รักษาบารมีสุขภาพให้คงอยู่"},
  }[tier];

  // per-part scores
  const partScores = PARTS.map(p=>{
    let m=0,s=0;
    p.questions.forEach(q=>{ const a=answers[q.id]; if(a){m+=a.merit||0;s+=a.sin||0;} });
    if(p.id==="body"&&bmiStatus) m+=bmiStatus.merit>0?bmiStatus.merit:0, s+=bmiStatus.merit<0?Math.abs(bmiStatus.merit):0;
    const max=p.questions.length*2+(p.id==="body"?2:0);
    return {score:m-s, max, level:getPredLevel(m,(p.questions.length+(p.id==="body"?1:0))*2)};
  });

  const curPart=PARTS[partIdx];
  const curQ=curPart?.questions[qIdx];

  const goTo=s=>setTimeout(()=>setStep(s),80);

  const answerQ=(opt,i)=>{
    setClickedOpt(i);
    setTimeout(()=>{
      setClickedOpt(null);
      setAnswers(prev=>({...prev,[curQ.id]:opt}));
      if(qIdx+1<curPart.questions.length) setQIdx(qIdx+1);
      else if(partIdx+1<PARTS.length){setPartIdx(partIdx+1);setQIdx(0);}
      else setStep("result");
    },400);
  };

  const validateDob=()=>{
    if(!dob.d||!dob.m||!dob.y){setDobError("กรุณากรอกวันเดือนปีเกิดให้ครบ");return false;}
    if(!dayOfWeek){setDobError("กรุณาเลือกวันเกิด");return false;}
    if(!weight||!height){setDobError("กรุณากรอกน้ำหนักและส่วนสูง");return false;}
    setDobError(""); return true;
  };

  const handleSaveProfile=async()=>{
    if(!profile.gender){setProfileError("กรุณาเลือกเพศ");return;}
    setProfileError("");
    // คำนวณอายุจากปีเกิด
    const birthYear = dob.y ? (parseInt(dob.y) - 543) : null;
    const age = birthYear ? (new Date().getFullYear() - birthYear) : null;
    const rec={
      timestamp:new Date().toISOString(),
      name:profile.name||"ไม่ระบุ",
      gender:profile.gender,
      feedback:profile.feedback||"",
      // จากหน้าตรวจดวงชะตาราศี
      dob:`${dob.d}/${dob.m}/${dob.y}`,
      age_calculated: age,
      day_of_week:dayOfWeek,
      zodiac:zodiac?.name||"",
      zodiac_element:zodiac?.element||"",
      weight,height,bmi,bmi_status:bmiStatus?.label||"",
      // ผลประเมิน
      score:pct,tier,merit:totalMerit,sin:totalSin,
    };
    try{await window.storage.set(`hm:${Date.now()}`,JSON.stringify(rec),true);}catch{}
    setProfileSaved(true);
  };

  const exportImg=async()=>{
    if(!yantraRef.current) return;
    try{
      const{default:h2c}=await import("https://cdnjs.cloudflare.com/ajax/libs/html2canvas/1.4.1/html2canvas.esm.js");
      const c=await h2c(yantraRef.current,{backgroundColor:DARK,scale:2});
      const a=document.createElement("a");a.download="healthmoo-result.png";a.href=c.toDataURL("image/png");a.click();
      setExported(true);setTimeout(()=>setExported(false),2500);
    }catch{alert("กรุณา Screenshot เพื่อบันทึกครับ");}
  };

  const reset=()=>{setStep("welcome");setPartIdx(0);setQIdx(0);setAnswers({});setDob({d:"",m:"",y:""});setDayOfWeek("");setWeight("");setHeight("");setConsented(false);setProfile({name:"",age:"",gender:"",feedback:""});setProfileSaved(false);setActiveOrb(null);};

  const base={minHeight:"100vh",background:`linear-gradient(160deg,${DARK} 0%,#2d1b4e 60%,#1a0a2e 100%)`,color:"#f0e6c8",fontFamily:"'Segoe UI',sans-serif",display:"flex",flexDirection:"column",alignItems:"center",padding:"clamp(12px,3vw,24px) clamp(8px,2vw,16px)",position:"relative",overflow:"hidden"};
  const btnBase=(extra={})=>({display:"block",width:"100%",background:"rgba(255,255,255,0.04)",border:`1px solid ${GOLD}44`,borderRadius:12,padding:"13px 16px",color:"#f0e6c8",textAlign:"left",cursor:"pointer",marginBottom:9,fontSize:14,transition:"all .2s ease",...extra});

  // ── WELCOME ──
  if(step==="welcome") return(<div style={base}><Particles/>
    <Page vis={vis}><div style={{textAlign:"center"}}>
      <div style={{fontSize:60,animation:"pulse 2s ease-in-out infinite"}}>🔮</div>
      <KanokBorder/>
      <h1 style={{color:GOLD,fontSize:"clamp(24px,6vw,32px)",margin:"10px 0 2px",fontWeight:900,letterSpacing:3,background:`linear-gradient(90deg,#C9A84C,#ffe8a0,#C9A84C)`,backgroundSize:"200% auto",WebkitBackgroundClip:"text",WebkitTextFillColor:"transparent",animation:"shimmer 3s linear infinite"}}>Health-Moo</h1>
      <p style={{color:GOLD,fontSize:"clamp(10px,3vw,12px)",letterSpacing:5,marginBottom:14}}>KARMA LEDGER v2</p>
      <KanokBorder/>
      <div style={{background:"rgba(201,168,76,0.08)",border:`1px solid ${GOLD}44`,borderRadius:16,padding:"18px 22px",margin:"20px 0",animation:"fadeIn 1s ease .3s both"}}>
        <p style={{fontSize:14,lineHeight:2,color:"#e8d5a3"}}>
          <strong style={{color:GOLD}}>มูเตลูดูดวงสุขภาพ แม่นๆ ตามราศี</strong><br/>
          วิเคราะห์ <strong style={{color:"#b388ff"}}>4 มิติชีวิต</strong> — ร่างกาย จิตใจ ปัญญา สังคม<br/>
          ผสาน <strong style={{color:GOLD}}>ศาสตร์ดูดวง + วิชาการสุขภาพ</strong> จาก ศอ.10
        </p>
      </div>
      <div style={{display:"flex",justifyContent:"center",gap:16,marginBottom:20}}>
        {["🔥","🌙","🧠","🌺"].map((e,i)=>(<div key={i} style={{fontSize:28,animation:`float${i%3} ${3+i}s ease-in-out infinite`,animationDelay:`${i*.4}s`}}>{e}</div>))}
      </div>
      <button className="btn-cta" onClick={()=>goTo("profile")} style={{background:`linear-gradient(135deg,${GOLD},#a07830)`,color:DARK,border:"none",borderRadius:50,padding:"15px 40px",fontSize:17,fontWeight:900,cursor:"pointer",letterSpacing:1,width:"100%",boxShadow:`0 0 30px ${GOLD}44`,transition:"all .2s ease"}}>
        🔮 เริ่มตรวจดวงชะตาสุขภาพ
      </button>
      <p style={{fontSize:11,color:"#504030",marginTop:16}}>ศูนย์อนามัยที่ 10 อุบลราชธานี | อ.อัจฉรา</p>
    </div></Page>
  </div>);

  // ── PROFILE / DOB ──
  if(step==="profile") return(<div style={base}><Particles/>
    <Page vis={vis}>
      <button onClick={()=>goTo("welcome")} style={{background:"none",border:"none",color:GOLD,cursor:"pointer",fontSize:13,marginBottom:14}}>← ย้อนกลับ</button>
      <KanokBorder/>
      <h2 style={{color:GOLD,textAlign:"center",fontSize:20,margin:"10px 0 4px"}}>ตรวจดวงชะตาราศี</h2>
      <p style={{textAlign:"center",fontSize:12,color:"#a08060",marginBottom:20}}>กรอกข้อมูลพื้นฐานเพื่อวิเคราะห์ดวงรายบุคคล</p>

      <div style={{background:"rgba(201,168,76,0.06)",border:`1px solid ${GOLD}33`,borderRadius:14,padding:"18px",marginBottom:14}}>
        <p style={{fontSize:12,color:GOLD,fontWeight:700,marginBottom:12}}>📅 วันเดือนปีเกิด</p>
        <div style={{display:"flex",gap:8,marginBottom:10}}>
          <select style={{...selStyle,flex:1}} value={dob.d} onChange={e=>setDob(p=>({...p,d:e.target.value}))}>
            <option value="">วันที่</option>
            {[...Array(31)].map((_,i)=><option key={i+1} value={i+1}>{i+1}</option>)}
          </select>
          <select style={{...selStyle,flex:2}} value={dob.m} onChange={e=>setDob(p=>({...p,m:e.target.value}))}>
            <option value="">เดือน</option>
            {["มกราคม","กุมภาพันธ์","มีนาคม","เมษายน","พฤษภาคม","มิถุนายน","กรกฎาคม","สิงหาคม","กันยายน","ตุลาคม","พฤศจิกายน","ธันวาคม"].map((m,i)=><option key={i} value={i+1}>{m}</option>)}
          </select>
          <select style={{...selStyle,flex:2}} value={dob.y} onChange={e=>setDob(p=>({...p,y:e.target.value}))}>
            <option value="">ปี พ.ศ.</option>
            {[...Array(80)].map((_,i)=><option key={i} value={2567-i}>{2567-i}</option>)}
          </select>
        </div>
        <p style={{fontSize:12,color:GOLD,fontWeight:700,marginBottom:8}}>📆 วันเกิด</p>
        <div style={{display:"flex",gap:6,flexWrap:"wrap",marginBottom:12}}>
          {DAY_COLORS.map(d=>(
            <button key={d} onClick={()=>setDayOfWeek(d)} style={{padding:"7px 12px",borderRadius:50,fontSize:12,cursor:"pointer",border:`1px solid ${dayOfWeek===d?GOLD:GOLD+"44"}`,background:dayOfWeek===d?"rgba(201,168,76,0.25)":"rgba(255,255,255,0.04)",color:dayOfWeek===d?GOLD:"#f0e6c8",transition:"all .2s"}}>
              วัน{d}
            </button>
          ))}
        </div>

        {/* Zodiac preview */}
        {zodiac&&(
          <div style={{background:`rgba(142,68,173,0.15)`,border:`1px solid ${PURPLE}44`,borderRadius:10,padding:"10px 14px",marginBottom:10,animation:"slideUp .4s ease both"}}>
            <span style={{fontSize:20}}>{zodiac.emoji}</span>
            <span style={{color:"#b388ff",fontWeight:700,fontSize:14,marginLeft:8}}>ราศี{zodiac.name}</span>
            <span style={{fontSize:12,color:"#a08060",marginLeft:8}}>| ธาตุ{zodiac.element} · {zodiac.trait}</span>
            {dayOfWeek&&<div style={{fontSize:11,color:"#c0a870",marginTop:4}}>⚕️ {DAY_HEALTH[DAY_COLORS.indexOf(dayOfWeek)]}</div>}
          </div>
        )}

        <p style={{fontSize:12,color:GOLD,fontWeight:700,marginBottom:8}}>⚖️ น้ำหนัก & ส่วนสูง</p>
        <div style={{display:"flex",gap:8,marginBottom:8}}>
          <div style={{flex:1}}>
            <input style={iStyle} type="number" placeholder="น้ำหนัก (กก.)" value={weight} onChange={e=>setWeight(e.target.value)}/>
          </div>
          <div style={{flex:1}}>
            <input style={iStyle} type="number" placeholder="ส่วนสูง (ซม.)" value={height} onChange={e=>setHeight(e.target.value)}/>
          </div>
        </div>
        {bmi&&(
          <div style={{background:`${bmiStatus.color}22`,border:`1px solid ${bmiStatus.color}44`,borderRadius:8,padding:"8px 12px",fontSize:13,animation:"slideUp .3s ease both"}}>
            <strong style={{color:bmiStatus.color}}>BMI {bmi} — {bmiStatus.label}</strong>
            <div style={{fontSize:11,color:"#c0a870",marginTop:2}}>🔮 {bmiStatus.tip}</div>
          </div>
        )}
      </div>

      {dobError&&<p style={{color:RED,fontSize:12,textAlign:"center",marginBottom:8}}>{dobError}</p>}
      <button className="btn-cta" onClick={()=>{if(validateDob()) goTo("questions");}} style={{background:`linear-gradient(135deg,${GOLD},#a07830)`,color:DARK,border:"none",borderRadius:50,padding:"14px",fontSize:16,fontWeight:900,cursor:"pointer",width:"100%",transition:"all .2s ease",boxShadow:`0 0 24px ${GOLD}44`}}>
        ข้อต่อไป →
      </button>
    </Page>
  </div>);

  // ── QUESTIONS ──
  if(step==="questions"){
    const totalQ=PARTS.reduce((s,p)=>s+p.questions.length,0);
    const doneQ=PARTS.slice(0,partIdx).reduce((s,p)=>s+p.questions.length,0)+qIdx;
    const prog=Math.round((doneQ/totalQ)*100);
    return(<div style={base}><Particles/>
      <Page vis={vis}>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:6}}>
          <span style={{fontSize:11,color:GOLD,fontWeight:700}}>{curPart.label}</span>
          <span style={{fontSize:11,color:"#a08060"}}>{doneQ+1}/{totalQ}</span>
        </div>
        <div style={{background:"#2a1a4a",borderRadius:8,height:7,marginBottom:20,overflow:"hidden"}}>
          <div style={{background:`linear-gradient(90deg,${GOLD},#ffe080)`,height:7,borderRadius:8,width:`${prog}%`,transition:"width .5s cubic-bezier(.4,0,.2,1)",boxShadow:`0 0 10px ${GOLD}88`}}/>
        </div>
        {/* Part indicator */}
        <div style={{display:"flex",justifyContent:"center",gap:8,marginBottom:16}}>
          {PARTS.map((p,i)=>(
            <div key={i} style={{display:"flex",flexDirection:"column",alignItems:"center",gap:3}}>
              <div style={{fontSize:18,opacity:i<=partIdx?1:.3,transition:"opacity .3s"}}>{p.icon}</div>
              <div style={{width:6,height:6,borderRadius:"50%",background:i<partIdx?GOLD:i===partIdx?"#fff":"#2a1a4a",transition:"background .3s"}}/>
            </div>
          ))}
        </div>
        <KanokBorder/>
        <div style={{textAlign:"center",margin:"12px 0 6px"}}>
          <div style={{fontSize:28}}>{curPart.icon}</div>
          <h3 style={{color:GOLD,fontSize:16,margin:"4px 0"}}>{curPart.title}</h3>
        </div>
        <h2 style={{color:"#f0e6c8",fontSize:16,textAlign:"center",margin:"10px 0 20px",lineHeight:1.8}}>{curQ.q}</h2>
        {curQ.opts.map((opt,i)=>(
          <button key={i} className="btn-opt" onClick={()=>answerQ(opt,i)}
            style={{...btnBase(),background:clickedOpt===i?"rgba(201,168,76,0.3)":"rgba(255,255,255,0.04)",border:`1px solid ${clickedOpt===i?GOLD:GOLD+"44"}`,transform:clickedOpt===i?"scale(0.97)":"scale(1)",animationDelay:`${i*.07}s`,animation:"slideUp .35s ease both"}}>
            <span style={{marginRight:8}}>{opt.sin?"⚫":"🌕"}</span>{opt.t}
          </button>
        ))}
      </Page>
    </div>);
  }

  // ── RESULT ──
  if(step==="result"){
    const orbData=[
      {key:"body",label:"ร่างกาย",icon:"🔥",color:RED},
      {key:"mind",label:"จิตใจ",icon:"🌙",color:PURPLE},
      {key:"wisdom",label:"ปัญญา",icon:"🧠",color:YELLOW},
      {key:"society",label:"สังคม",icon:"🌺",color:GREEN},
    ];
    return(<div style={base}><Particles/>
      <Page vis={vis}>
        <div style={{textAlign:"center"}}>
          <KanokBorder/>
          <h2 style={{color:GOLD,fontSize:21,margin:"10px 0"}}>ดวงดีสร้างได้ แค่ดูแล 'สุข' ให้ครบ 4 ด้าน</h2>

          {/* Gauge */}
          <div style={{position:"relative",width:190,height:95,margin:"18px auto 6px",overflow:"hidden"}}>
            <svg viewBox="0 0 190 95" style={{width:"100%",height:"100%"}}>
              <path d="M10,95 A85,85 0 0,1 180,95" fill="none" stroke="#2a1a4a" strokeWidth="16" strokeLinecap="round"/>
              <path d="M10,95 A85,85 0 0,1 180,95" fill="none" stroke={tierInfo.color} strokeWidth="16" strokeLinecap="round"
                strokeDasharray={`${Math.PI*85*pct/100} ${Math.PI*85}`}
                style={{transition:"stroke-dasharray 1.2s cubic-bezier(.4,0,.2,1)",filter:`drop-shadow(0 0 8px ${tierInfo.color})`}}/>
            </svg>
            <div style={{position:"absolute",bottom:0,width:"100%",textAlign:"center"}}>
              <div style={{fontSize:30,fontWeight:900,color:tierInfo.color,filter:`drop-shadow(0 0 10px ${tierInfo.color})`}}>{pct}%</div>
            </div>
          </div>
          <div style={{fontSize:12,color:"#a08060",marginBottom:6}}>บุญ <span style={{color:GOLD}}>{totalMerit}</span> · บาป <span style={{color:RED}}>{totalSin}</span>{bmi&&<span> · BMI <span style={{color:bmiStatus.color}}>{bmi}</span></span>}</div>

          {/* Zodiac badge */}
          {zodiac&&(
            <div style={{display:"inline-flex",alignItems:"center",gap:8,background:"rgba(142,68,173,0.15)",border:`1px solid ${PURPLE}44`,borderRadius:50,padding:"6px 16px",marginBottom:14,fontSize:13}}>
              <span>{zodiac.emoji}</span><span style={{color:"#b388ff",fontWeight:700}}>ราศี{zodiac.name}</span>
              <span style={{color:"#a08060"}}>วัน{dayOfWeek}</span>
            </div>
          )}

          {/* Tier badge */}
          <div style={{background:`${tierInfo.color}22`,border:`2px solid ${tierInfo.color}`,borderRadius:14,padding:"14px 20px",display:"inline-block",marginBottom:20,boxShadow:`0 0 28px ${tierInfo.color}44`,animation:"pulse 2s ease-in-out infinite"}}>
            <div style={{fontSize:32}}>{tierInfo.emoji}</div>
            <div style={{fontSize:18,fontWeight:900,color:tierInfo.color}}>{tierInfo.label}</div>
            <div style={{fontSize:12,color:"#c0a870",marginTop:3}}>{tierInfo.sub}</div>
          </div>

          {/* 4 Orbs */}
          <p style={{fontSize:12,color:"#a08060",marginBottom:14}}>คลิกลูกแก้วเพื่อดูคำทำนายสุขภาพแต่ละด้าน</p>
          <div style={{display:"flex",justifyContent:"center",gap:14,marginBottom:16,flexWrap:"wrap"}}>
            {orbData.map((o,i)=>{
              const ps=partScores[i];
              const lv=ps.level;
              const active=activeOrb===o.key;
              return(
                <div key={o.key} onClick={()=>setActiveOrb(active?null:o.key)}
                  className="orb" style={{display:"flex",flexDirection:"column",alignItems:"center",gap:5,animation:`orbIn .5s ease ${i*.1}s both`}}>
                  <div style={{width:60,height:60,borderRadius:"50%",border:`2px solid ${active?o.color:o.color+"66"}`,
                    background:active?`radial-gradient(circle,${o.color}44,${o.color}11)`:`radial-gradient(circle,${o.color}11,transparent)`,
                    display:"flex",alignItems:"center",justifyContent:"center",fontSize:26,
                    boxShadow:active?`0 0 20px ${o.color}88`:"none",transition:"all .3s"}}>
                    {o.icon}
                  </div>
                  <div style={{fontSize:11,color:active?o.color:"#a08060",fontWeight:active?700:400,transition:"color .3s"}}>{o.label}</div>
                  <div style={{width:30,height:3,borderRadius:2,background:lv==="high"?GREEN:lv==="mid"?YELLOW:RED,boxShadow:`0 0 6px ${lv==="high"?GREEN:lv==="mid"?YELLOW:RED}`}}/>
                </div>
              );
            })}
          </div>

          {/* Orb detail */}
          {activeOrb&&(()=>{
            const idx=orbData.findIndex(o=>o.key===activeOrb);
            const o=orbData[idx]; const lv=partScores[idx].level;
            return(
              <div style={{background:`${o.color}11`,border:`1px solid ${o.color}44`,borderRadius:14,padding:"16px",marginBottom:16,textAlign:"left",animation:"slideUp .3s ease both"}}>
                <div style={{fontWeight:700,color:o.color,marginBottom:8,fontSize:14}}>{o.icon} {o.label}</div>
                <p style={{fontSize:13,lineHeight:1.9,color:"#e0d0b0"}}>{PREDICTIONS[activeOrb][lv]}</p>
              </div>
            );
          })()}

          {/* Yantra export card */}
          <div ref={yantraRef} style={{background:`linear-gradient(160deg,#1a0a2e,#2d1b4e)`,border:`2px solid ${GOLD}88`,borderRadius:18,padding:"20px",marginBottom:16,textAlign:"left",position:"relative",overflow:"hidden"}}>
            <div style={{position:"absolute",top:-10,right:-10,fontSize:80,opacity:.05}}>🔯</div>
            <div style={{textAlign:"center",marginBottom:14}}>
              <div style={{fontSize:28,animation:"spin 8s linear infinite",display:"inline-block"}}>🔯</div>
              <div style={{color:GOLD,fontWeight:900,fontSize:16,letterSpacing:2,marginTop:4}}>ยันต์คุ้มครองกาย</div>
              <div style={{fontSize:11,color:"#a08060"}}>แผนสุขภาพเฉพาะบุคคล ๓ ประการ</div>
              {zodiac&&<div style={{color:"#b388ff",fontSize:12,marginTop:4}}>{zodiac.emoji} ราศี{zodiac.name} · วัน{dayOfWeek}{bmi?` · BMI ${bmi}`:""}</div>}
              <div style={{color:tierInfo.color,fontSize:12,marginTop:2}}>{tierInfo.emoji} {tierInfo.label}</div>
            </div>
            {[
              tier==="crisis"?"🔥 โอม — นอนก่อนสี่ทุ่มทุกราตรี ให้ปราณได้ซ่อมแซมวิหารกาย\nมิเช่นนั้นหนี้กรรมแห่งโรคภัยจะทับถมมิอาจชำระได้":
              tier==="stable"?"🌙 จันทะ — วางมือถือก่อนนอน ๑ ชั่วโมง ให้จิตสงบดุจน้ำในคืนเพ็ญ\nบารมีสมองจักเพิ่มพูนทุกรุ่งอรุณ":
              "👑 มหาบารมี — รักษาวินัยสุขภาพราวกับพิทักษ์แก้วมณีอันล้ำค่า\nอย่าให้ความประมาทมาทำลายบารมีที่สั่งสมมา",
              bmiStatus?`⚖️ BMI ${bmi} — ${bmiStatus.tip}`:"🌿 พุทธัง — เดิน ๓๐ นาทีทุกวัน บุญแห่งการเคลื่อนไหวสะสมทีละก้าว",
              tier==="crisis"?"📿 นะโม — โทร ศอ.10 (045-251-267) รับคำแนะนำจากผู้เชี่ยวชาญฟรี\nอย่าแบกกรรมไว้คนเดียว":
              "🔯 อายุวัฒนะ — ตรวจสุขภาพประจำปีปิดช่องโหว่ที่ตาเนื้อมองไม่เห็น\nโรคร้ายทุกชนิดเริ่มจากสัญญาณเล็กน้อยที่ถูกมองข้าม"
            ].map((p,i)=>(
              <div key={i} style={{background:"rgba(255,255,255,0.04)",borderRadius:10,padding:"12px 14px",marginBottom:8,lineHeight:1.9,borderLeft:`3px solid ${GOLD}`,fontSize:13,whiteSpace:"pre-line",animation:`slideUp .4s ease ${i*.12}s both`}}>{p}</div>
            ))}
            <div style={{textAlign:"center",marginTop:10,fontSize:11,color:"#604030"}}>ศูนย์อนามัยที่ 10 อุบลราชธานี | Health-Moo Karma Ledger</div>
          </div>

          {/* CTA buttons */}
          <button className="btn-cta" onClick={exportImg} style={{display:"block",width:"100%",background:exported?`linear-gradient(135deg,${GREEN},#1a6a40)`:`linear-gradient(135deg,#4a3010,${GOLD})`,color:"#fff",border:"none",borderRadius:50,padding:"12px",fontSize:14,fontWeight:900,cursor:"pointer",marginBottom:8,transition:"all .3s ease",boxShadow:`0 0 18px ${GOLD}44`}}>
            {exported?"✅ บันทึกสำเร็จ!":"📥 เซฟภาพยันต์ไว้แชร์ต่อ"}
          </button>
          {tier==="crisis"&&<a href="tel:045251267" className="btn-cta" style={{display:"block",background:`linear-gradient(135deg,${RED},#8b0000)`,color:"#fff",borderRadius:50,padding:"13px",fontSize:15,fontWeight:900,textDecoration:"none",marginBottom:8,transition:"all .2s ease",boxShadow:`0 0 18px ${RED}66`,animation:"pulse 1.5s ease-in-out infinite",textAlign:"center"}}>📞 โทรสายด่วน ศอ.10: 045-251-267</a>}
          <a href="https://line.me" target="_blank" rel="noreferrer" className="btn-cta" style={{display:"block",background:"#06C755",color:"#fff",borderRadius:50,padding:"11px",fontSize:14,fontWeight:700,textDecoration:"none",marginBottom:8,transition:"all .2s ease",textAlign:"center"}}>💬 เข้าร่วม Line Group สุขภาวะ</a>

          {/* Consent & Profile */}
          <div style={{background:"rgba(201,168,76,0.06)",border:`1px solid ${GOLD}33`,borderRadius:14,padding:"18px",marginBottom:10,textAlign:"left"}}>
            <div style={{textAlign:"center",marginBottom:10}}><span style={{fontSize:20}}>🛡️</span>
              <div style={{color:GOLD,fontWeight:900,fontSize:14}}>การยินยอมเก็บข้อมูล (PDPA)</div></div>
            <div style={{background:"rgba(0,0,0,0.2)",borderRadius:10,padding:"12px",marginBottom:12,fontSize:11,lineHeight:1.9,color:"#c0a870",maxHeight:130,overflowY:"auto",border:`1px solid ${GOLD}22`}}>
              <strong style={{color:GOLD}}>หนังสือยินยอมการเก็บรวบรวมข้อมูล</strong> — ศูนย์อนามัยที่ 10<br/>
              ข้าพเจ้ายินยอมให้ ศอ.10 เก็บรวบรวมและประมวลผลข้อมูลส่วนบุคคล ได้แก่ ชื่อ อายุ เพศ ผลประเมินสุขภาพ และข้อเสนอแนะ เพื่อ (1) วิจัยพัฒนาแผนสุขภาพรายบุคคล (2) ปรับปรุงบริการ Health-Moo (3) สถิติสาธารณสุขภาคอีสาน ข้อมูลถูกเก็บตาม พ.ร.บ.PDPA 2562 ไม่เปิดเผยต่อบุคคลภายนอก ถอนความยินยอมได้ทุกเมื่อโดยโทร 045-251-267
            </div>
            <label style={{display:"flex",alignItems:"flex-start",gap:10,cursor:"pointer",marginBottom:12}}>
              <div onClick={()=>setConsented(!consented)} style={{width:20,height:20,minWidth:20,borderRadius:5,border:`2px solid ${consented?GOLD:GOLD+"66"}`,background:consented?GOLD:"transparent",display:"flex",alignItems:"center",justifyContent:"center",transition:"all .2s",cursor:"pointer",flexShrink:0,marginTop:1}}>
                {consented&&<span style={{color:DARK,fontWeight:900,fontSize:13}}>✓</span>}
              </div>
              <span style={{fontSize:12,lineHeight:1.7,color:"#e0c87a"}}>ข้าพเจ้าได้อ่านและ<strong style={{color:GOLD}}>ยินยอม</strong>ให้เก็บรวบรวมข้อมูลตามเงื่อนไขข้างต้น</span>
            </label>
            {consented&&!profileSaved&&(
              <div style={{animation:"slideUp .4s ease both"}}>
                <div style={{marginBottom:8}}>
                  <input style={{...iStyle}} placeholder="ชื่อ-นามสกุล (ไม่บังคับ)" value={profile.name} onChange={e=>setProfile(p=>({...p,name:e.target.value}))}/>
                </div>
                <div style={{display:"flex",gap:6,flexWrap:"wrap",marginBottom:8}}>
                  {["ชาย","หญิง","LGBTQ+","ไม่ระบุ"].map(g=>(
                    <button key={g} onClick={()=>setProfile(p=>({...p,gender:g}))} style={{padding:"6px 14px",borderRadius:50,fontSize:12,cursor:"pointer",border:`1px solid ${profile.gender===g?GOLD:GOLD+"44"}`,background:profile.gender===g?"rgba(201,168,76,0.25)":"rgba(255,255,255,0.04)",color:profile.gender===g?GOLD:"#f0e6c8",transition:"all .2s"}}>{g}</button>
                  ))}
                </div>
                <textarea style={{...iStyle,minHeight:70,resize:"vertical",marginBottom:8}} placeholder="ข้อเสนอแนะ (ไม่บังคับ)" value={profile.feedback} onChange={e=>setProfile(p=>({...p,feedback:e.target.value}))}/>
                {profileError&&<p style={{color:RED,fontSize:11,marginBottom:8,textAlign:"center"}}>{profileError}</p>}
                <button className="btn-cta" onClick={handleSaveProfile} style={{display:"block",width:"100%",background:`linear-gradient(135deg,#1a4a30,${GREEN})`,color:"#fff",border:"none",borderRadius:50,padding:"11px",fontSize:14,fontWeight:900,cursor:"pointer",transition:"all .3s ease"}}>
                  💾 บันทึกข้อมูล
                </button>
              </div>
            )}
            {profileSaved&&<div style={{textAlign:"center",padding:"12px",background:`rgba(39,174,96,.12)`,borderRadius:10,border:`1px solid ${GREEN}44`,animation:"slideUp .4s ease both"}}>
              <div style={{fontSize:24}}>✅</div>
              <div style={{color:GREEN,fontWeight:900,fontSize:14}}>บันทึกข้อมูลสำเร็จ</div>
              <div style={{fontSize:11,color:"#a0c0a0",marginTop:3}}>ขอบคุณที่ร่วมพัฒนาสุขภาวะชุมชนครับ 🙏</div>
            </div>}
          </div>

          <button className="btn-cta" onClick={reset} style={{display:"block",width:"100%",background:"rgba(201,168,76,0.1)",border:`1px solid ${GOLD}44`,borderRadius:50,padding:"11px",color:GOLD,fontSize:13,cursor:"pointer",transition:"all .2s ease",marginBottom:6}}>
            🔄 ตรวจดวงใหม่อีกครั้ง
          </button>
          <p style={{fontSize:10,color:"#504030",marginTop:6}}>ศูนย์อนามัยที่ 10 อุบลราชธานี | อ.อัจฉรา</p>
        </div>
      </Page>
    </div>);
  }
}