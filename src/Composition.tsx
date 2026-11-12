
import React from "react";
import {
  AbsoluteFill,
  useCurrentFrame,
  useVideoConfig,
  interpolate,
  Easing,
  spring,
} from "remotion";

const gold = "#D6AD62";

const Pillar = ({ left }: { left: string }) => (
  <div style={{
    position: "absolute",
    left,
    top: 0,
    width: 115,
    height: "100%",
    background: "linear-gradient(90deg,#392012,#A87538,#E4C17C,#68401F,#29170F)",
    borderLeft: "9px solid #D1A45B",
    borderRight: "9px solid #402518",
    boxShadow: "0 0 45px #000",
  }}>
    <div style={{
      position: "absolute", top: "12%", left: -18,
      width: 133, height: 35, background: "#C89B54",
      border: "5px solid #55371F",
    }}/>
    <div style={{
      position: "absolute", bottom: "12%", left: -18,
      width: 133, height: 35, background: "#C89B54",
      border: "5px solid #55371F",
    }}/>
    {Array.from({length: 9}).map((_,i)=>(
      <div key={i} style={{
        position:"absolute",top:`${20+i*7}%`,
        left:15,width:65,height:2,
        background:"#E7C98C",opacity:.35
      }}/>
    ))}
  </div>
);

const Emperor = () => (
  <svg viewBox="0 0 360 530" width="100%" height="100%">
    <defs>
      <linearGradient id="robe" x2="1" y2="1">
        <stop stopColor="#E9D4A1"/>
        <stop offset=".5" stopColor="#9B713B"/>
        <stop offset="1" stopColor="#3F2415"/>
      </linearGradient>
      <linearGradient id="skin" x2="1">
        <stop stopColor="#9B5D35"/>
        <stop offset="1" stopColor="#E0A36C"/>
      </linearGradient>
    </defs>
    {/* Throne */}
    <path d="M65 500 L65 175 Q180 -10 295 175 L295 500Z"
      fill="#74421F" stroke="#D9B46D" strokeWidth="12"/>
    <path d="M90 490 L90 190 Q180 35 270 190 L270 490"
      fill="#3E2118" stroke="#B78B4E" strokeWidth="8"/>
    <path d="M110 475 L110 235 Q180 100 250 235 L250 475"
      fill="#9B6A32" stroke="#E5C77E" strokeWidth="5"/>
    {/* Crown */}
    <path d="M125 125 L145 62 L180 95 L215 62 L235 125Z"
      fill="#D9B15E" stroke="#F8DFA4" strokeWidth="5"/>
    <circle cx="180" cy="80" r="10" fill="#A82C26"/>
    {/* Head */}
    <ellipse cx="180" cy="165" rx="54" ry="67" fill="url(#skin)"/>
    {/* Turban */}
    <path d="M125 150 Q110 70 180 67 Q250 70 235 150
      Q205 119 180 130 Q150 115 125 150"
      fill="#E9D7B2" stroke="#A77A3F" strokeWidth="7"/>
    <path d="M145 120 Q180 85 220 120" fill="none"
      stroke="#C49A4F" strokeWidth="8"/>
    {/* Face */}
    <path d="M150 168 L168 168 M193 168 L210 168"
      stroke="#2B1A12" strokeWidth="6" strokeLinecap="round"/>
    <path d="M165 210 Q180 222 196 210"
      fill="none" stroke="#46251B" strokeWidth="5"/>
    {/* Beard */}
    <path d="M140 195 Q180 255 220 195 L205 248
      Q180 278 155 248Z" fill="#3C2418"/>
    {/* Royal robe */}
    <path d="M115 240 Q180 215 245 240 L290 470
      L70 470Z" fill="url(#robe)" stroke="#E2BD77" strokeWidth="8"/>
    <path d="M180 240 L180 465" stroke="#EBD49C" strokeWidth="7"/>
    <path d="M125 270 L235 270 M110 320 L250 320"
      stroke="#D2AA62" strokeWidth="5"/>
    {/* Necklace */}
    <path d="M140 245 Q180 320 220 245"
      fill="none" stroke="#F0D17F" strokeWidth="9"/>
    <circle cx="180" cy="300" r="13" fill="#A92F29"
      stroke="#F0D17F" strokeWidth="5"/>
    {/* Arms */}
    <path d="M110 270 Q65 300 95 365 L140 345"
      fill="none" stroke="#C99B64" strokeWidth="30"/>
    <path d="M250 270 Q295 300 265 365 L220 345"
      fill="none" stroke="#C99B64" strokeWidth="30"/>
  </svg>
);

const Courtier = ({x,scale=1}: {x:number,scale?:number}) => (
  <div style={{
    position:"absolute",left:x, bottom:95,
    width:105,height:220,
    transform:`scale(${scale})`,
    transformOrigin:"bottom center",
  }}>
    <div style={{
      position:"absolute",top:0,left:27,width:50,height:55,
      borderRadius:"50%",background:"#A96943",
      borderTop:"12px solid #382116"
    }}/>
    <div style={{
      position:"absolute",top:45,left:12,width:80,height:155,
      background:"linear-gradient(90deg,#39221B,#A94C32,#E2B36C,#47251A)",
      clipPath:"polygon(30% 0,70% 0,100% 100%,0 100%)"
    }}/>
  </div>
);

export const MughalCourt: React.FC = () => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();

  const camera = interpolate(frame,[0,450],[1,1.16],{
    extrapolateRight:"clamp",
    easing:Easing.inOut(Easing.cubic)
  });

  const intro = spring({
    frame,
    fps,
    config:{damping:18,stiffness:65}
  });

  const titleOpacity = interpolate(frame,[0,45,105,145],[0,0,1,0],{
    extrapolateRight:"clamp"
  });

  const finalOpacity = interpolate(frame,[350,390,449],[0,1,1],{
    extrapolateRight:"clamp"
  });

  return (
    <AbsoluteFill style={{
      background:"#100A08",
      overflow:"hidden",
      fontFamily:"Georgia,serif",
    }}>
      {/* Cinematic camera */}
      <div style={{
        position:"absolute",inset:0,
        transform:`scale(${camera})`,
        transformOrigin:"center 55%",
      }}>
        {/* Palace background */}
        <AbsoluteFill style={{
          background:"linear-gradient(180deg,#1A100D,#56351E 55%,#120A07)",
        }}/>

        {/* Grand arches */}
        <svg width="100%" height="100%"
          viewBox="0 0 1920 1080"
          preserveAspectRatio="none"
          style={{position:"absolute"}}>
          <defs>
            <linearGradient id="wall" x2="0" y2="1">
              <stop stopColor="#9B7041"/>
              <stop offset="1" stopColor="#28150F"/>
            </linearGradient>
          </defs>
          <path d="M250 1080 V350 Q960 -400 1670 350 V1080Z"
            fill="none" stroke="#C69A55" strokeWidth="28"/>
          <path d="M360 1080 V400 Q960 -180 1560 400 V1080"
            fill="none" stroke="#754820" strokeWidth="15"/>
          <path d="M450 1080 V450 Q960 -50 1470 450 V1080"
            fill="none" stroke="#B9894B" strokeWidth="8"/>
          <path d="M0 0 H1920 V1080 H0Z"
            fill="none" stroke="#D1AA68" strokeWidth="20"/>
        </svg>

        {/* Columns */}
        <Pillar left="4%"/>
        <Pillar left="22%"/>
        <Pillar left="72%"/>
        <Pillar left="90%"/>

        {/* Royal floor */}
        <div style={{
          position:"absolute",bottom:0,width:"100%",height:"35%",
          background:"linear-gradient(180deg,#9C6132,#32170E)",
          borderTop:"8px solid #D5AC65",
        }}/>
        <div style={{
          position:"absolute",bottom:0,left:"16%",width:"68%",
          height:"30%",
          background:"linear-gradient(90deg,#681D1A,#A12E27,#5D1715)",
          borderTop:"5px solid #D8B46C",
          borderBottom:"12px solid #D0A45B",
          clipPath:"polygon(20% 0,80% 0,100% 100%,0 100%)"
        }}/>

        {/* Throne and Emperor */}
        <div style={{
          position:"absolute",
          width:410,height:590,
          left:"50%",top:"16%",
          transform:`translateX(-50%) scale(${intro})`,
          filter:"drop-shadow(0 0 35px #F4B95A)",
        }}>
          <Emperor/>
        </div>

        {/* Royal courtiers */}
        {[230,370,530,700,1110,1280,1450,1610].map((x,i)=>(
          <Courtier key={i} x={x} scale={i%2===0?1:0.83}/>
        ))}

        {/* Golden light */}
        <div style={{
          position:"absolute",inset:0,
          background:"radial-gradient(ellipse at 50% 35%,#FFD98A38,transparent 55%)",
          mixBlendMode:"screen",
        }}/>

        {/* Floating golden dust */}
        {Array.from({length:55}).map((_,i)=>{
          const x=(i*137)%1920;
          const y=(i*83+frame*(0.5+(i%4)*0.25))%1080;
          return <div key={i} style={{
            position:"absolute",left:x,top:y,
            width:i%3===0?5:3,height:i%3===0?5:3,
            borderRadius:"50%",background:"#FFD68A",
            opacity:.3+(i%5)*.1,
            boxShadow:"0 0 12px #FFCB70"
          }}/>;
        })}

        {/* Vignette */}
        <AbsoluteFill style={{
          background:"radial-gradient(ellipse,transparent 38%,#080402B8 100%)"
        }}/>
      </div>

      {/* Opening title */}
      <AbsoluteFill style={{
        justifyContent:"center",
        alignItems:"center",
        opacity:titleOpacity,
        textAlign:"center",
      }}>
        <div style={{
          color:gold,fontSize:30,letterSpacing:12,
          textShadow:"0 0 25px #E6B65B",
        }}>
          THE MUGHAL EMPIRE
        </div>
        <div style={{
          color:"#FFF0D0",fontSize:100,
          fontWeight:"bold",letterSpacing:5,
          textShadow:"0 5px 30px #000",
          marginTop:15,
        }}>
          SHAH JAHAN
        </div>
        <div style={{
          width:450,height:3,background:gold,marginTop:25
        }}/>
        <div style={{
          color:"#E4C58C",fontSize:25,
          letterSpacing:8,marginTop:25
        }}>
          THE IMPERIAL COURT
        </div>
      </AbsoluteFill>

      {/* Final title */}
      <AbsoluteFill style={{
        justifyContent:"flex-end",
        alignItems:"center",
        paddingBottom:90,
        opacity:finalOpacity,
      }}>
        <div style={{
          fontSize:55,color:"#F2D69C",
          letterSpacing:5,
          textShadow:"0 3px 20px #000",
        }}>
          THE AGE OF MUGHAL GRANDEUR
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};

export default MughalCourt;
