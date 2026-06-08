import { useState, useEffect, useRef } from "react";

const API_URL = "http://127.0.0.1:8000/predict";

const T = {
  USA:{name:"United States",flag:"🇺🇸",str:82},MEX:{name:"Mexico",flag:"🇲🇽",str:75},CAN:{name:"Canada",flag:"🇨🇦",str:72},
  BRA:{name:"Brazil",flag:"🇧🇷",str:91},ARG:{name:"Argentina",flag:"🇦🇷",str:94},COL:{name:"Colombia",flag:"🇨🇴",str:78},
  URU:{name:"Uruguay",flag:"🇺🇾",str:79},ECU:{name:"Ecuador",flag:"🇪🇨",str:68},PER:{name:"Peru",flag:"🇵🇪",str:65},
  CHI:{name:"Chile",flag:"🇨🇱",str:67},VEN:{name:"Venezuela",flag:"🇻🇪",str:63},PAR:{name:"Paraguay",flag:"🇵🇾",str:62},
  BOL:{name:"Bolivia",flag:"🇧🇴",str:55},GER:{name:"Germany",flag:"🇩🇪",str:88},FRA:{name:"France",flag:"🇫🇷",str:92},
  ESP:{name:"Spain",flag:"🇪🇸",str:89},ENG:{name:"England",flag:"🏴󠁧󠁢󠁥󠁮󠁧󠁿",str:87},POR:{name:"Portugal",flag:"🇵🇹",str:86},
  NED:{name:"Netherlands",flag:"🇳🇱",str:83},BEL:{name:"Belgium",flag:"🇧🇪",str:80},ITA:{name:"Italy",flag:"🇮🇹",str:81},
  SUI:{name:"Switzerland",flag:"🇨🇭",str:76},AUT:{name:"Austria",flag:"🇦🇹",str:74},CRO:{name:"Croatia",flag:"🇭🇷",str:77},
  DEN:{name:"Denmark",flag:"🇩🇰",str:75},SWE:{name:"Sweden",flag:"🇸🇪",str:73},POL:{name:"Poland",flag:"🇵🇱",str:72},
  UKR:{name:"Ukraine",flag:"🇺🇦",str:70},SRB:{name:"Serbia",flag:"🇷🇸",str:71},SCO:{name:"Scotland",flag:"🏴󠁧󠁢󠁳󠁣󠁴󠁿",str:68},
  MAR:{name:"Morocco",flag:"🇲🇦",str:79},SEN:{name:"Senegal",flag:"🇸🇳",str:74},NGA:{name:"Nigeria",flag:"🇳🇬",str:71},
  EGY:{name:"Egypt",flag:"🇪🇬",str:68},RSA:{name:"South Africa",flag:"🇿🇦",str:62},CMR:{name:"Cameroon",flag:"🇨🇲",str:65},
  TUN:{name:"Tunisia",flag:"🇹🇳",str:64},ALG:{name:"Algeria",flag:"🇩🇿",str:67},JPN:{name:"Japan",flag:"🇯🇵",str:78},
  KOR:{name:"South Korea",flag:"🇰🇷",str:74},AUS:{name:"Australia",flag:"🇦🇺",str:69},IRN:{name:"Iran",flag:"🇮🇷",str:67},
  SAU:{name:"Saudi Arabia",flag:"🇸🇦",str:65},QAT:{name:"Qatar",flag:"🇶🇦",str:61},NZL:{name:"New Zealand",flag:"🇳🇿",str:59},
  CHN:{name:"China",flag:"🇨🇳",str:63},TUR:{name:"Turkey",flag:"🇹🇷",str:73},HUN:{name:"Hungary",flag:"🇭🇺",str:68}
};

const ISO = {
  840:"USA",484:"MEX",124:"CAN",76:"BRA",32:"ARG",170:"COL",858:"URU",218:"ECU",604:"PER",152:"CHI",
  862:"VEN",600:"PAR",68:"BOL",276:"GER",250:"FRA",724:"ESP",826:"ENG",620:"POR",528:"NED",56:"BEL",
  380:"ITA",756:"SUI",40:"AUT",191:"CRO",208:"DEN",752:"SWE",616:"POL",804:"UKR",688:"SRB",
  504:"MAR",686:"SEN",566:"NGA",818:"EGY",710:"RSA",120:"CMR",788:"TUN",12:"ALG",
  392:"JPN",410:"KOR",36:"AUS",364:"IRN",682:"SAU",634:"QAT",554:"NZL",156:"CHN",792:"TUR",348:"HUN"
};

async function calcProb(cA, cB) {
  const homeTeam = T[cA].name;
  const awayTeam = T[cB].name;

  const response = await fetch(API_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      home_team: homeTeam,
      away_team: awayTeam
    })
  });

  if (!response.ok) {
    throw new Error("Prediction request failed");
  }

  const data = await response.json();

  const homeWin = data.probabilities["Home Win"] || 0;
  const awayWin = data.probabilities["Away Win"] || 0;
  const draw = data.probabilities["Draw"] || 0;

  return {
    pA: Math.round(homeWin * 100),
    pB: Math.round(awayWin * 100),
    pD: Math.round(draw * 100),
    conf: Math.round(Math.max(homeWin, awayWin, draw) * 100),
    prediction: data.prediction
  };
}

function calcProbLocal(cA, cB) {
  const a = T[cA], b = T[cB], tot = a.str + b.str;
  const rawA = (a.str / tot) * 100;
  const diff = Math.abs(a.str - b.str);
  const draw = Math.max(5, Math.min(28, 20 - diff * 0.15));
  const rem = 100 - draw;
  const pA = Math.round((rawA / 100) * rem);
  const pB = 100 - Math.round(draw) - pA;

  return {
    pA,
    pB,
    pD: Math.round(draw),
    conf: Math.min(95, 60 + Math.round(diff * 0.3))
  };
}

function getH2H(cA, cB) {
  const diff = T[cA].str - T[cB].str;
  const wA = Math.round(3 + Math.max(0, diff / 10));
  const wB = Math.round(3 + Math.max(0, -diff / 10));
  const d = Math.round(2 + Math.random());
  return { wA, wB, d };
}

function simMatch(cA, cB) {
  const r = calcProbLocal(cA, cB);
  const rand = Math.random() * 100;

  if (rand < r.pA) return cA;
  if (rand < r.pA + r.pD) return Math.random() < 0.5 ? cA : cB;

  return cB;
}

const css = `
  @import url('https://fonts.googleapis.com/css2?family=Bebas+Neue&family=Share+Tech+Mono&family=Barlow+Condensed:wght@400;600;700&display=swap');
  .wc-app * { box-sizing: border-box; margin: 0; padding: 0; }
  .wc-app { font-family: 'Barlow Condensed', sans-serif; background: #0a0e1a; color: #e8dcc8; border-radius: 12px; overflow: hidden; }
  .wc-hdr { background: #0d1525; border-bottom: 1px solid #c9a227; padding: 12px 18px; display: flex; align-items: center; justify-content: space-between; }
  .wc-title { font-family: 'Bebas Neue', sans-serif; font-size: 26px; letter-spacing: 3px; color: #c9a227; }
  .wc-sub { font-family: 'Share Tech Mono', monospace; font-size: 10px; color: #7a8fa6; letter-spacing: 2px; margin-top: 2px; }
  .wc-badge { background: #c9a227; color: #0a0e1a; font-family: 'Bebas Neue', sans-serif; font-size: 12px; letter-spacing: 2px; padding: 4px 10px; border-radius: 4px; }
  .wc-body { display: grid; grid-template-columns: 1fr 265px; }
  .map-area { background: #0d1525; border-right: 1px solid #1e2d45; padding: 10px; position: relative; }
  .map-lbl { font-family: 'Share Tech Mono', monospace; font-size: 10px; color: #3d5270; letter-spacing: 2px; margin-bottom: 6px; }
  .wc-panel { background: #0a0e1a; display: flex; flex-direction: column; padding: 14px; gap: 12px; overflow-y: auto; max-height: 600px; }
  .sec-title { font-family: 'Share Tech Mono', monospace; font-size: 10px; color: #3d5270; letter-spacing: 2px; border-bottom: 1px solid #1e2d45; padding-bottom: 5px; }
  .tabs { display: flex; border-bottom: 1px solid #1e2d45; }
  .tab-btn { font-family: 'Barlow Condensed', sans-serif; font-size: 12px; font-weight: 600; letter-spacing: 1px; padding: 6px 10px; cursor: pointer; color: #3d5270; border: none; background: none; border-bottom: 2px solid transparent; margin-bottom: -1px; transition: all .2s; }
  .tab-btn.active { color: #c9a227; border-bottom-color: #c9a227; }
  .tab-btn:hover:not(.active) { color: #7a8fa6; }
  .slot { background: #0d1525; border: 1px dashed #1e2d45; border-radius: 6px; padding: 9px 11px; display: flex; align-items: center; gap: 9px; min-height: 50px; cursor: pointer; transition: all .3s; }
  .slot.filled-a { border: 1px solid #22c55e; }
  .slot.filled-b { border: 1px solid #3a7bd5; }
  .slot-flag { font-size: 22px; min-width: 26px; }
  .slot-name { font-family: 'Bebas Neue', sans-serif; font-size: 15px; letter-spacing: 1px; }
  .slot-empty { font-family: 'Share Tech Mono', monospace; font-size: 10px; color: #3d5270; letter-spacing: 1px; }
  .vs-div { text-align: center; font-family: 'Bebas Neue', sans-serif; font-size: 20px; color: #1e2d45; letter-spacing: 4px; }
  .pred-btn { background: #c9a227; color: #0a0e1a; font-family: 'Bebas Neue', sans-serif; font-size: 17px; letter-spacing: 3px; border: none; border-radius: 6px; padding: 11px; cursor: pointer; width: 100%; transition: all .2s; }
  .pred-btn:hover { opacity: .9; }
  .pred-btn:disabled { background: #1e2d45; color: #3d5270; cursor: default; }
  .result-empty { font-family: 'Share Tech Mono', monospace; font-size: 10px; color: #3d5270; text-align: center; padding: 16px 0; letter-spacing: 1px; line-height: 2; }
  .error-box { font-family: 'Share Tech Mono', monospace; font-size: 10px; color: #ff8080; text-align: center; padding: 12px 0; letter-spacing: 1px; line-height: 1.7; border: 1px solid #633; border-radius: 6px; }
  .prow { display: flex; flex-direction: column; gap: 4px; }
  .pname { font-family: 'Bebas Neue', sans-serif; font-size: 13px; letter-spacing: 1px; display: flex; justify-content: space-between; align-items: center; }
  .ppct { font-family: 'Share Tech Mono', monospace; font-size: 12px; }
  .pbar-bg { background: #1e2d45; border-radius: 3px; height: 7px; overflow: hidden; }
  .pbar { height: 100%; border-radius: 3px; transition: width 1s cubic-bezier(.4,0,.2,1); }
  .bar-a { background: #c9a227; } .bar-b { background: #3a7bd5; } .bar-d { background: #3d5270; }
  .wbadge { font-family: 'Bebas Neue', sans-serif; font-size: 10px; letter-spacing: 1px; padding: 2px 6px; border-radius: 3px; margin-left: 4px; }
  .wbadge.g { background: #c9a227; color: #0a0e1a; } .wbadge.b { background: #3a7bd5; color: #fff; }
  .conf-row { font-family: 'Share Tech Mono', monospace; font-size: 10px; color: #3d5270; text-align: center; letter-spacing: 1px; margin-top: 2px; }
  .h2h-row { display: flex; justify-content: space-between; font-size: 12px; padding: 4px 0; border-bottom: 1px solid #1e2d45; }
  .h2h-lbl { font-family: 'Share Tech Mono', monospace; font-size: 9px; color: #3d5270; letter-spacing: 1px; }
  .h2h-val { font-family: 'Bebas Neue', sans-serif; font-size: 14px; letter-spacing: 1px; }
  .action-btn { background: transparent; border: 1px solid #1e2d45; color: #3d5270; font-family: 'Share Tech Mono', monospace; font-size: 10px; letter-spacing: 1px; padding: 7px; border-radius: 4px; cursor: pointer; width: 100%; transition: all .2s; margin-top: 4px; }
  .action-btn:hover { border-color: #c9a227; color: #c9a227; }
  .rank-item { display: flex; align-items: center; gap: 7px; padding: 4px 5px; cursor: pointer; border-radius: 4px; transition: background .2s; }
  .rank-item:hover { background: #0d1525; }
  .rnum { font-family: 'Share Tech Mono', monospace; font-size: 10px; color: #3d5270; min-width: 16px; }
  .rflag { font-size: 15px; }
  .rname { font-family: 'Barlow Condensed', sans-serif; font-size: 13px; font-weight: 600; flex: 1; letter-spacing: .5px; }
  .rpct { font-family: 'Share Tech Mono', monospace; font-size: 11px; color: #c9a227; }
  .brnd-lbl { font-family: 'Share Tech Mono', monospace; font-size: 9px; color: #3d5270; letter-spacing: 2px; margin-top: 4px; margin-bottom: 2px; }
  .bm { display: flex; align-items: center; gap: 4px; margin-bottom: 3px; }
  .bt { background: #0d1525; border: 1px solid #1e2d45; border-radius: 4px; padding: 4px 8px; font-family: 'Barlow Condensed', sans-serif; font-size: 12px; font-weight: 600; letter-spacing: .5px; flex: 1; display: flex; align-items: center; gap: 5px; }
  .bt.winner { border-color: #c9a227; color: #c9a227; }
  .bt.loser { opacity: .4; }
  .bt-vs { font-family: 'Bebas Neue', sans-serif; font-size: 11px; color: #1e2d45; padding: 0 2px; }
  .champion-box { background: #0d1525; border: 1px solid #c9a227; border-radius: 6px; padding: 10px; text-align: center; margin-top: 6px; }
  .champion-lbl { font-family: 'Share Tech Mono', monospace; font-size: 9px; color: #3d5270; letter-spacing: 2px; margin-bottom: 4px; }
  .champion-name { font-family: 'Bebas Neue', sans-serif; font-size: 22px; color: #c9a227; letter-spacing: 2px; }
  .tooltip { position: absolute; background: #1a2540; border: 1px solid #c9a227; color: #e8dcc8; font-family: 'Barlow Condensed', sans-serif; font-size: 13px; letter-spacing: 1px; padding: 4px 10px; border-radius: 4px; pointer-events: none; z-index: 10; white-space: nowrap; }
`;

function WorldMap({ selA, selB, onSelect }) {
  const svgRef = useRef(null);
  const [tooltip, setTooltip] = useState({ visible: false, text: "", x: 0, y: 0 });

  useEffect(() => {
    let d3, topojson;

    async function loadMap() {
      const [d3Module, topoModule] = await Promise.all([
        import("https://cdn.jsdelivr.net/npm/d3@7/+esm"),
        import("https://cdn.jsdelivr.net/npm/topojson-client@3/+esm"),
      ]);

      d3 = d3Module;
      topojson = topoModule;

      const svg = d3.select(svgRef.current);
      const w = 900, h = 420;
      const proj = d3.geoNaturalEarth1().scale(143).translate([w / 2, h / 2 + 18]);
      const path = d3.geoPath().projection(proj);

      const world = await d3.json("https://cdn.jsdelivr.net/npm/world-atlas@2/countries-110m.json");
      const countries = topojson.feature(world, world.objects.countries);

      svg.selectAll("*").remove();
      svg.append("rect").attr("width", w).attr("height", h).attr("fill", "#0a0e1a");

      svg.append("g").selectAll("path")
        .data(countries.features)
        .enter().append("path")
        .attr("d", path)
        .attr("data-code", d => ISO[+d.id] || "")
        .attr("fill", d => {
          const code = ISO[+d.id];
          if (!code) return "#1a2540";
          if (code === selA) return "#4ade80";
          if (code === selB) return "#6daaf0";
          return "#c9a227";
        })
        .attr("stroke", "#0a0e1a")
        .attr("strokeWidth", 0.5)
        .style("cursor", d => ISO[+d.id] ? "pointer" : "default")
        .on("mouseover", function (ev, d) {
          const code = ISO[+d.id];
          if (!code) return;

          const rect = svgRef.current.closest(".map-area").getBoundingClientRect();

          setTooltip({
            visible: true,
            text: `${T[code].flag} ${T[code].name}`,
            x: ev.clientX - rect.left + 10,
            y: ev.clientY - rect.top - 30
          });

          if (code !== selA && code !== selB) {
            d3.select(this).attr("fill", "#e8b830");
          }
        })
        .on("mousemove", function (ev) {
          const rect = svgRef.current.closest(".map-area").getBoundingClientRect();

          setTooltip(t => ({
            ...t,
            x: ev.clientX - rect.left + 10,
            y: ev.clientY - rect.top - 30
          }));
        })
        .on("mouseout", function (ev, d) {
          setTooltip(t => ({ ...t, visible: false }));

          const code = ISO[+d.id];

          if (!code) return;
          if (code === selA) return d3.select(this).attr("fill", "#4ade80");
          if (code === selB) return d3.select(this).attr("fill", "#6daaf0");

          d3.select(this).attr("fill", "#c9a227");
        })
        .on("click", function (ev, d) {
          const code = ISO[+d.id];
          if (code) onSelect(code);
        });
    }

    loadMap();
  }, [selA, selB, onSelect]);

  return (
    <div className="map-area">
      <div className="map-lbl">▸ PARTICIPANT NATIONS — CLICK TO SELECT</div>
      <svg ref={svgRef} viewBox="0 0 900 420" style={{ width: "100%", height: 420, cursor: "pointer" }} />
      {tooltip.visible && (
        <div className="tooltip" style={{ left: tooltip.x, top: tooltip.y }}>
          {tooltip.text}
        </div>
      )}
    </div>
  );
}

function DuelTab({ selA, selB, onClearA, onClearB }) {
  const [state, setState] = useState("idle");
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);

  const runPred = async () => {
    try {
      setState("loading");
      setError(null);

      const r = await calcProb(selA, selB);
      const h = getH2H(selA, selB);

      setResult({ r, h });
      setState("done");
    } catch (err) {
      console.error(err);
      setError("Could not connect to prediction API.");
      setState("idle");
    }
  };

  const reset = () => {
    onClearA();
    onClearB();
    setState("idle");
    setResult(null);
    setError(null);
  };

  const share = () => {
    const tA = T[selA], tB = T[selB], r = result.r;
    const txt = `⚽ World Cup 2026 Prediction\n\n${tA.flag} ${tA.name} ${r.pA}% vs ${r.pB}% ${tB.name} ${tB.flag}\n\nPowered by my ML predictor`;

    navigator.clipboard.writeText(txt)
      .then(() => alert("Copied!"))
      .catch(() => alert(txt));
  };

  const tA = selA ? T[selA] : null;
  const tB = selB ? T[selB] : null;
  const winA = result && result.r.pA >= result.r.pB;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
      <div className="sec-title">SELECT MATCHUP</div>

      <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
        <div className={`slot ${selA ? "filled-a" : ""}`} onClick={onClearA}>
          <span className="slot-flag">{tA ? tA.flag : "🌍"}</span>
          {tA ? <span className="slot-name">{tA.name.toUpperCase()}</span> : <span className="slot-empty">— click on map —</span>}
        </div>

        <div className="vs-div">VS</div>

        <div className={`slot ${selB ? "filled-b" : ""}`} onClick={onClearB}>
          <span className="slot-flag">{tB ? tB.flag : "🌍"}</span>
          {tB ? <span className="slot-name">{tB.name.toUpperCase()}</span> : <span className="slot-empty">— click on map —</span>}
        </div>
      </div>

      {state !== "done" ? (
        <button className="pred-btn" disabled={!(selA && selB) || state === "loading"} onClick={runPred}>
          {state === "loading" ? "ANALYZING..." : "PREDICT RESULT"}
        </button>
      ) : (
        <button className="pred-btn" onClick={reset}>RESET DUEL</button>
      )}

      {error && (
        <div className="error-box">
          API CONNECTION ERROR<br />
          CHECK FASTAPI SERVER
        </div>
      )}

      {state === "idle" && !error && (
        <div className="result-empty">SELECT TWO<br />NATIONS TO<br />START ANALYSIS</div>
      )}

      {state === "done" && result && (
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          <div className="sec-title">WIN PROBABILITIES</div>

          {[
            { label: `${tA.flag} ${tA.name.toUpperCase()}`, pct: result.r.pA, cls: "bar-a", color: "#c9a227", fav: winA },
            { label: "DRAW", pct: result.r.pD, cls: "bar-d", color: "#7a8fa6", fav: false },
            { label: `${tB.flag} ${tB.name.toUpperCase()}`, pct: result.r.pB, cls: "bar-b", color: "#3a7bd5", fav: !winA },
          ].map((row, i) => (
            <div className="prow" key={i}>
              <div className="pname">
                <span style={{ color: row.color }}>{row.label}</span>
                <span className="ppct" style={{ color: row.color }}>
                  {row.pct}%
                  {row.fav && <span className={`wbadge ${i === 0 ? "g" : "b"}`}>FAVORITE</span>}
                </span>
              </div>

              <div className="pbar-bg">
                <div className={`pbar ${row.cls}`} style={{ width: `${row.pct}%` }} />
              </div>
            </div>
          ))}

          <div className="conf-row">MODEL CONFIDENCE: {result.r.conf}%</div>
          <div className="conf-row">PREDICTION: {result.r.prediction?.toUpperCase()}</div>

          <div className="sec-title" style={{ marginTop: 4 }}>HEAD TO HEAD (EST.)</div>

          <div className="h2h-row">
            <span className="h2h-lbl">WINS</span>
            <span className="h2h-val" style={{ color: "#c9a227" }}>{result.h.wA}</span>
            <span className="h2h-lbl">DRAWS</span>
            <span className="h2h-val" style={{ color: "#7a8fa6" }}>{result.h.d}</span>
            <span className="h2h-lbl">WINS</span>
            <span className="h2h-val" style={{ color: "#3a7bd5" }}>{result.h.wB}</span>
          </div>

          <div className="h2h-row" style={{ border: "none" }}>
            <span className="h2h-lbl">{tA.name.toUpperCase()}</span>
            <span />
            <span className="h2h-lbl">{tB.name.toUpperCase()}</span>
          </div>

          <button className="action-btn" onClick={share}>COPY PREDICTION CARD ↗</button>
        </div>
      )}
    </div>
  );
}

function BracketTab() {
  const [bracket, setBracket] = useState(null);

  const simulate = () => {
    const top16 = Object.keys(T).sort((a, b) => T[b].str - T[a].str).slice(0, 16);
    const r16 = [], qf = [], sf = [], fin = [];

    for (let i = 0; i < 16; i += 2) r16.push([top16[i], top16[i + 1]]);

    const r16w = r16.map(m => simMatch(m[0], m[1]));

    for (let i = 0; i < 8; i += 2) qf.push([r16w[i], r16w[i + 1]]);

    const qfw = qf.map(m => simMatch(m[0], m[1]));

    for (let i = 0; i < 4; i += 2) sf.push([qfw[i], qfw[i + 1]]);

    const sfw = sf.map(m => simMatch(m[0], m[1]));

    fin.push([sfw[0], sfw[1]]);

    const champion = simMatch(sfw[0], sfw[1]);

    setBracket({ r16, r16w, qf, qfw, sf, sfw, fin, champion });
  };

  const Round = ({ label, matches, winners }) => (
    <>
      <div className="brnd-lbl">{label}</div>
      {matches.map((m, i) => (
        <div className="bm" key={i}>
          <div className={`bt ${winners[i] === m[0] ? "winner" : "loser"}`}>
            <span>{T[m[0]].flag}</span><span>{T[m[0]].name.toUpperCase()}</span>
          </div>

          <div className="bt-vs">VS</div>

          <div className={`bt ${winners[i] === m[1] ? "winner" : "loser"}`}>
            <span>{T[m[1]].flag}</span><span>{T[m[1]].name.toUpperCase()}</span>
          </div>
        </div>
      ))}
    </>
  );

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
      <div className="sec-title">KNOCKOUT SIMULATOR</div>

      <button className="action-btn" onClick={simulate}>SIMULATE FULL TOURNAMENT ↗</button>

      {!bracket && <div className="result-empty">Click simulate to run<br />the full knockout stage</div>}

      {bracket && (
        <>
          <Round label="ROUND OF 16" matches={bracket.r16} winners={bracket.r16w} />
          <Round label="QUARTERFINALS" matches={bracket.qf} winners={bracket.qfw} />
          <Round label="SEMIFINALS" matches={bracket.sf} winners={bracket.sfw} />
          <Round label="FINAL" matches={bracket.fin} winners={[bracket.champion]} />

          <div className="champion-box">
            <div className="champion-lbl">WORLD CHAMPION</div>
            <div className="champion-name">{T[bracket.champion].flag} {T[bracket.champion].name.toUpperCase()}</div>
          </div>

          <button className="action-btn" onClick={simulate}>SIMULATE AGAIN ↗</button>
        </>
      )}
    </div>
  );
}

function RankingTab({ onSelect }) {
  const sorted = Object.entries(T).sort((a, b) => b[1].str - a[1].str).slice(0, 12);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
      <div className="sec-title">TOP TITLE CONTENDERS</div>

      {sorted.map(([code, t], i) => (
        <div className="rank-item" key={code} onClick={() => onSelect(code)}>
          <span className="rnum">{String(i + 1).padStart(2, "0")}</span>
          <span className="rflag">{t.flag}</span>
          <span className="rname">{t.name.toUpperCase()}</span>
          <span className="rpct">{Math.round((t.str / 94) * 28)}%</span>
        </div>
      ))}
    </div>
  );
}

export default function WorldCup2026Predictor() {
  const [selA, setSelA] = useState(null);
  const [selB, setSelB] = useState(null);
  const [activeTab, setActiveTab] = useState("duel");

  const selectCountry = (code) => {
    if (selA === code || selB === code) return;

    if (!selA) {
      setSelA(code);
    } else if (!selB) {
      setSelB(code);
    }
  };

  const selectFromRanking = (code) => {
    selectCountry(code);
    setActiveTab("duel");
  };

  return (
    <>
      <style>{css}</style>

      <div className="wc-app">
        <div className="wc-hdr">
          <div>
            <div className="wc-title">⚽ World Cup 2026 Predictor</div>
            <div className="wc-sub">SELECT TWO COUNTRIES ON THE MAP TO PREDICT THE MATCH</div>
          </div>

          <div className="wc-badge">48 TEAMS</div>
        </div>

        <div className="wc-body">
          <WorldMap selA={selA} selB={selB} onSelect={selectCountry} />

          <div className="wc-panel">
            <div className="tabs">
              {["duel", "bracket", "ranking"].map(tab => (
                <button
                  key={tab}
                  className={`tab-btn ${activeTab === tab ? "active" : ""}`}
                  onClick={() => setActiveTab(tab)}
                >
                  {tab.toUpperCase()}
                </button>
              ))}
            </div>

            {activeTab === "duel" && (
              <DuelTab
                selA={selA}
                selB={selB}
                onClearA={() => setSelA(null)}
                onClearB={() => setSelB(null)}
              />
            )}

            {activeTab === "bracket" && <BracketTab />}

            {activeTab === "ranking" && (
              <RankingTab onSelect={selectFromRanking} />
            )}
          </div>
        </div>
      </div>
    </>
  );
}