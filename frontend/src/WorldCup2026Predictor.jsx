import { useState, useEffect, useRef } from "react";

const API_URL = "http://127.0.0.1:8000/predict";

const T = {
  USA:{name:"United States",flag:"🇺🇸",str:82},MEX:{name:"Mexico",flag:"🇲🇽",str:75},CAN:{name:"Canada",flag:"🇨🇦",str:72},
  BRA:{name:"Brazil",flag:"🇧🇷",str:91},ARG:{name:"Argentina",flag:"🇦🇷",str:94},COL:{name:"Colombia",flag:"🇨🇴",str:78},
  URU:{name:"Uruguay",flag:"🇺🇾",str:79},ECU:{name:"Ecuador",flag:"🇪🇨",str:68},PER:{name:"Peru",flag:"🇵🇪",str:65},
  CHI:{name:"Chile",flag:"🇨🇱",str:67},VEN:{name:"Venezuela",flag:"🇻🇪",str:63},PAR:{name:"Paraguay",flag:"🇵🇾",str:62},
  BOL:{name:"Bolivia",flag:"🇧🇴",str:55},GER:{name:"Germany",flag:"🇩🇪",str:88},FRA:{name:"France",flag:"🇫🇷",str:92},
  ESP:{name:"Spain",flag:"🇪🇸",str:89},ENG:{name:"England",flag:"EN",str:87},POR:{name:"Portugal",flag:"🇵🇹",str:86},
  NED:{name:"Netherlands",flag:"🇳🇱",str:83},BEL:{name:"Belgium",flag:"🇧🇪",str:80},ITA:{name:"Italy",flag:"🇮🇹",str:81},
  SUI:{name:"Switzerland",flag:"🇨🇭",str:76},AUT:{name:"Austria",flag:"🇦🇹",str:74},CRO:{name:"Croatia",flag:"🇭🇷",str:77},
  DEN:{name:"Denmark",flag:"🇩🇰",str:75},SWE:{name:"Sweden",flag:"🇸🇪",str:73},POL:{name:"Poland",flag:"🇵🇱",str:72},
  UKR:{name:"Ukraine",flag:"🇺🇦",str:70},SRB:{name:"Serbia",flag:"🇷🇸",str:71},SCO:{name:"Scotland",flag:"SC",str:68},
  MAR:{name:"Morocco",flag:"🇲🇦",str:79},SEN:{name:"Senegal",flag:"🇸🇳",str:74},NGA:{name:"Nigeria",flag:"🇳🇬",str:71},
  EGY:{name:"Egypt",flag:"🇪🇬",str:68},RSA:{name:"South Africa",flag:"🇿🇦",str:62},CMR:{name:"Cameroon",flag:"🇨🇲",str:65},
  TUN:{name:"Tunisia",flag:"🇹🇳",str:64},ALG:{name:"Algeria",flag:"🇩🇿",str:67},JPN:{name:"Japan",flag:"🇯🇵",str:78},
  KOR:{name:"South Korea",flag:"🇰🇷",str:74},AUS:{name:"Australia",flag:"🇦🇺",str:69},IRN:{name:"Iran",flag:"🇮🇷",str:67},
  SAU:{name:"Saudi Arabia",flag:"🇸🇦",str:65},QAT:{name:"Qatar",flag:"🇶🇦",str:61},NZL:{name:"New Zealand",flag:"🇳🇿",str:59},
  CHN:{name:"China",flag:"🇨🇳",str:63},TUR:{name:"Turkey",flag:"🇹🇷",str:73},HUN:{name:"Hungary",flag:"🇭🇺",str:68},
  BIH:{name:"Bosnia and Herzegovina",flag:"🇧🇦",str:70},HTI:{name:"Haiti",flag:"🇭🇹",str:58},CZE:{name:"Czech Republic",flag:"🇨🇿",str:73},
  CUW:{name:"Curacao",flag:"🇨🇼",str:60},CIV:{name:"Ivory Coast",flag:"🇨🇮",str:72},CPV:{name:"Cape Verde",flag:"🇨🇻",str:65},
 NOR:{name:"Norway",flag:"🇳🇴",str:78},JOR:{name:"Jordan",flag:"🇯🇴",str:62},COD:{name:"DR Congo",flag:"🇨🇩",str:67},
 UZB:{name:"Uzbekistan",flag:"🇺🇿",str:69},GHA:{name:"Ghana",flag:"🇬🇭",str:68},PAN:{name:"Panama",flag:"🇵🇦",str:64}

};
const ISO = {
  840:"USA",484:"MEX",124:"CAN",76:"BRA",32:"ARG",170:"COL",858:"URU",218:"ECU",604:"PER",152:"CHI",
  862:"VEN",600:"PAR",68:"BOL",276:"GER",250:"FRA",724:"ESP",826:"ENG",620:"POR",528:"NED",56:"BEL",
  380:"ITA",756:"SUI",40:"AUT",191:"CRO",208:"DEN",752:"SWE",616:"POL",804:"UKR",688:"SRB",
  504:"MAR",686:"SEN",566:"NGA",818:"EGY",710:"RSA",120:"CMR",788:"TUN",12:"ALG",
  392:"JPN",410:"KOR",36:"AUS",364:"IRN",682:"SAU",634:"QAT",554:"NZL",156:"CHN",792:"TUR",348:"HUN"
};

const GROUPS = {
  A: ["MEX", "RSA", "KOR", "CZE"],
  B: ["CAN", "BIH", "QAT", "SUI"],
  C: ["BRA", "MAR", "HTI", "SCO"],
  D: ["USA", "PAR", "AUS", "TUR"],
  E: ["GER", "CUW", "CIV", "ECU"],
  F: ["NED", "JPN", "SWE", "TUN"],
  G: ["BEL", "EGY", "IRN", "NZL"],
  H: ["ESP", "CPV", "SAU", "URU"],
  I: ["FRA", "SEN", "BOL", "NOR"],
  J: ["ARG", "ALG", "AUT", "JOR"],
  K: ["POR", "COD", "UZB", "COL"],
  L: ["ENG", "CRO", "GHA", "PAN"]
};

// ─── Prediction logic ────────────────────────────────────────────────────────
// Replace this function with a real API call to your backend.
// Your API should receive { team_a: "BRA", team_b: "ARG" }
// and return { pA: number, pB: number, pD: number, conf: number }
function calcProbLocal(cA, cB) {
  const a = T[cA];
  const b = T[cB];
  const tot = a.str + b.str;

  const rawA = (a.str / tot) * 100;
  const diff = Math.abs(a.str - b.str);
  const draw = Math.max(5, Math.min(28, 20 - diff * 0.15));
  const rem = 100 - draw;

  const pA = Math.round((rawA / 100) * rem);
  const pD = Math.round(draw);
  const pB = 100 - pD - pA;

  let prediction = "Draw";

  if (pA > pB && pA > pD) {
    prediction = "Home Win";
  } else if (pB > pA && pB > pD) {
    prediction = "Away Win";
  }

  return {
    pA,
    pB,
    pD,
    conf: Math.min(95, 60 + Math.round(diff * 0.3)),
    prediction,
    source: "local-fallback"
  };
}

async function calcProb(cA, cB) {
  try {
    const response = await fetch(API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        home_team: T[cA].name,
        away_team: T[cB].name
      })
    });

    if (!response.ok) {
      throw new Error(`API request failed with status ${response.status}`);
    }

    const data = await response.json();

    const homeWin = data.probabilities?.["Home Win"] || 0;
    const draw = data.probabilities?.["Draw"] || 0;
    const awayWin = data.probabilities?.["Away Win"] || 0;

    return {
      pA: Math.round(homeWin * 100),
      pD: Math.round(draw * 100),
      pB: Math.round(awayWin * 100),
      conf: Math.round(Math.max(homeWin, draw, awayWin) * 100),
      prediction: data.prediction,
      source: "api"
    };
  } catch (error) {
    console.warn(
      `Falling back to local probabilities for ${T[cA].name} vs ${T[cB].name}`,
      error
    );

    return calcProbLocal(cA, cB);
  }
}

function getH2H(cA, cB) {
  const diff = T[cA].str - T[cB].str;
  const wA = Math.round(3 + Math.max(0, diff / 10));
  const wB = Math.round(3 + Math.max(0, -diff / 10));
  const d = Math.round(2 + Math.random());

  return { wA, wB, d };
}

async function simulateMatchResult(cA, cB, allowDraw = true) {
  const probabilities = await calcProb(cA, cB);
  const rand = Math.random() * 100;

  let outcome;

  if (rand < probabilities.pA) {
    outcome = "Home Win";
  } else if (rand < probabilities.pA + probabilities.pD) {
    outcome = "Draw";
  } else {
    outcome = "Away Win";
  }

  let winner = null;

  if (outcome === "Home Win") {
    winner = cA;
  } else if (outcome === "Away Win") {
    winner = cB;
  } else if (!allowDraw) {
    winner = Math.random() < 0.5 ? cA : cB;
  }

  return {
    home: cA,
    away: cB,
    outcome,
    winner,
    probabilities
  };
}

async function simMatch(cA, cB) {
  const match = await simulateMatchResult(cA, cB, false);

  return match.winner;
}

// ─── Styles ──────────────────────────────────────────────────────────────────
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
  .slot.filled-a { border: 1px solid #12883d; }
  .slot.filled-b { border: 1px solid #3a7bd5; }
  .slot-flag { font-size: 22px; min-width: 26px; }
  .slot-name { font-family: 'Bebas Neue', sans-serif; font-size: 15px; letter-spacing: 1px; }
  .slot-empty { font-family: 'Share Tech Mono', monospace; font-size: 10px; color: #3d5270; letter-spacing: 1px; }
  .vs-div { text-align: center; font-family: 'Bebas Neue', sans-serif; font-size: 20px; color: #1e2d45; letter-spacing: 4px; }
  .pred-btn { background: #c9a227; color: #0a0e1a; font-family: 'Bebas Neue', sans-serif; font-size: 17px; letter-spacing: 3px; border: none; border-radius: 6px; padding: 11px; cursor: pointer; width: 100%; transition: all .2s; }
  .pred-btn:hover { opacity: .9; }
  .pred-btn:disabled { background: #1e2d45; color: #3d5270; cursor: default; }
  .result-empty { font-family: 'Share Tech Mono', monospace; font-size: 10px; color: #3d5270; text-align: center; padding: 16px 0; letter-spacing: 1px; line-height: 2; }
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

// ─── Map Component ────────────────────────────────────────────────────────────
function WorldMap({ selA, selB, onSelect }) {
  const svgRef = useRef(null);
  const [tooltip, setTooltip] = useState({ visible: false, text: "", x: 0, y: 0 });

  useEffect(() => {
    let d3, topojson;
    async function loadMap() {
      // Load D3 and TopoJSON dynamically
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
          if (code === selA) return "#1ada60";
          if (code === selB) return "#6daaf0";
          return "#c9a227";
        })
        .attr("stroke", "#0a0e1a").attr("stroke-width", 0.5)
        .style("cursor", d => ISO[+d.id] ? "pointer" : "default")
        .style("transition", "fill .2s")
        .on("mouseover", function (ev, d) {
          const code = ISO[+d.id];
          if (!code) return;
          const rect = svgRef.current.closest(".map-area").getBoundingClientRect();
          setTooltip({ visible: true, text: `${T[code].flag} ${T[code].name}`, x: ev.clientX - rect.left + 10, y: ev.clientY - rect.top - 30 });
          if (code !== selA && code !== selB) d3.select(this).attr("fill", "#e8b830");
        })
        .on("mousemove", function (ev) {
          const rect = svgRef.current.closest(".map-area").getBoundingClientRect();
          setTooltip(t => ({ ...t, x: ev.clientX - rect.left + 10, y: ev.clientY - rect.top - 30 }));
        })
        .on("mouseout", function (ev, d) {
          setTooltip(t => ({ ...t, visible: false }));
          const code = ISO[+d.id];
          if (!code) return;
          if (code === selA) { d3.select(this).attr("fill", "#1ada60"); return; }
          if (code === selB) { d3.select(this).attr("fill", "#6daaf0"); return; }
          d3.select(this).attr("fill", "#c9a227");
        })
        .on("click", function (ev, d) {
          const code = ISO[+d.id];
          if (code) onSelect(code);
        });
    }
    loadMap();
  }, [selA, selB]);

  return (
    <div className="map-area">
      <div className="map-lbl">▸ PARTICIPANT NATIONS — CLICK TO SELECT</div>
      <svg ref={svgRef} viewBox="0 0 900 420" style={{ width: "100%", height: 420, cursor: "pointer" }} />
      {tooltip.visible && (
        <div className="tooltip" style={{ left: tooltip.x, top: tooltip.y }}>{tooltip.text}</div>
      )}
    </div>
  );
}

// ─── Duel Tab ─────────────────────────────────────────────────────────────────
function DuelTab({ selA, selB, onClearA, onClearB, onSelectFromRanking }) {
  const [state, setState] = useState("idle"); // idle | loading | done
  const [result, setResult] = useState(null);

  const runPred = async () => {
    try {
      setState("loading");

      const r = await calcProb(selA, selB);
      const h = getH2H(selA, selB);

      setResult({ r, h });
      setState("done");
    } catch (error) {
      console.error(error);
      alert("Could not run prediction. Check the FastAPI server.");
      setState("idle");
    }
  };

  const reset = () => { onClearA(); onClearB(); setState("idle"); setResult(null); };

  const share = () => {
    const tA = T[selA], tB = T[selB], r = result.r;
    const txt = `⚽ World Cup 2026 Prediction\n\n${tA.flag} ${tA.name} ${r.pA}% vs ${r.pB}% ${tB.name} ${tB.flag}\n\nPowered by my ML predictor`;
    navigator.clipboard.writeText(txt).then(() => alert("Copied!")).catch(() => alert(txt));
  };

  const tA = selA ? T[selA] : null;
  const tB = selB ? T[selB] : null;
  const winA = result && result.r.pA > result.r.pB;

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

      {state === "idle" && (
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

async function simulateGroup(groupTeams) {
  const table = {};

  groupTeams.forEach(team => {
    table[team] = {
      pts: 0,
      wins: 0,
      draws: 0,
      losses: 0
    };
  });

  const matches = [];

  for (let i = 0; i < groupTeams.length; i++) {
    for (let j = i + 1; j < groupTeams.length; j++) {
      const home = groupTeams[i];
      const away = groupTeams[j];

      const match = await simulateMatchResult(home, away, true);

      matches.push(match);

      if (match.outcome === "Home Win") {
        table[home].pts += 3;
        table[home].wins += 1;
        table[away].losses += 1;
      } else if (match.outcome === "Away Win") {
        table[away].pts += 3;
        table[away].wins += 1;
        table[home].losses += 1;
      } else {
        table[home].pts += 1;
        table[away].pts += 1;
        table[home].draws += 1;
        table[away].draws += 1;
      }
    }
  }

  const ranking = Object.entries(table)
    .sort((a, b) => {
      const statsA = a[1];
      const statsB = b[1];

      if (statsB.pts !== statsA.pts) {
        return statsB.pts - statsA.pts;
      }

      if (statsB.wins !== statsA.wins) {
        return statsB.wins - statsA.wins;
      }

      return T[b[0]].str - T[a[0]].str;
    })
    .map(([team, stats]) => ({
      team,
      ...stats
    }));

  return {
    ranking,
    matches,
    qualified: [
      ranking[0].team,
      ranking[1].team
    ],
    thirdPlace: ranking[2]
  };
}

// ─── Bracket Tab ──────────────────────────────────────────────────────────────
function BracketTab() {
  const [bracket, setBracket] = useState(null);
  const [state, setState] = useState("idle");
  const [error, setError] = useState(null);

  const simulateKnockoutRound = async (matches) => {
    const winners = await Promise.all(
      matches.map(match => simMatch(match[0], match[1]))
    );

    return winners;
  };

  const buildNextRound = (winners) => {
    const matches = [];

    for (let i = 0; i < winners.length; i += 2) {
      matches.push([
        winners[i],
        winners[i + 1]
      ]);
    }

    return matches;
  };

  const simulate = async () => {
    try {
      setState("loading");
      setError(null);
      setBracket(null);

      const groupResults = {};
      const qualifiedTeams = [];
      const thirdPlacedTeams = [];

      for (const [groupName, teams] of Object.entries(GROUPS)) {
        const result = await simulateGroup(teams);

        groupResults[groupName] = result;
        qualifiedTeams.push(...result.qualified);
        thirdPlacedTeams.push(result.thirdPlace);
      }

      const bestThirds = thirdPlacedTeams
        .sort((a, b) => {
          if (b.pts !== a.pts) {
            return b.pts - a.pts;
          }

          if (b.wins !== a.wins) {
            return b.wins - a.wins;
          }

          return T[b.team].str - T[a.team].str;
        })
        .slice(0, 8)
        .map(team => team.team);

      const round32Teams = [
        ...qualifiedTeams,
        ...bestThirds
      ];

      const round32 = [];

      for (let i = 0; i < 16; i++) {
        round32.push([
          round32Teams[i],
          round32Teams[31 - i]
        ]);
      }

      const round32Winners = await simulateKnockoutRound(round32);

      const round16 = buildNextRound(round32Winners);
      const round16Winners = await simulateKnockoutRound(round16);

      const quarterfinals = buildNextRound(round16Winners);
      const quarterfinalWinners = await simulateKnockoutRound(quarterfinals);

      const semifinals = buildNextRound(quarterfinalWinners);
      const semifinalWinners = await simulateKnockoutRound(semifinals);

      const final = buildNextRound(semifinalWinners);
      const champion = await simMatch(final[0][0], final[0][1]);

      setBracket({
        groupResults,
        round32,
        round32Winners,
        round16,
        round16Winners,
        quarterfinals,
        quarterfinalWinners,
        semifinals,
        semifinalWinners,
        final,
        champion
      });

      setState("done");
    } catch (err) {
  console.error("Tournament simulation error:", err);

  setError(
    err?.message || "Could not run tournament simulation."
  );

  setState("idle");
}
  };

  const GroupTable = ({ groupName, result }) => (
    <>
      <div className="brnd-lbl">GROUP {groupName}</div>

      {result.ranking.map((row, index) => (
        <div className="rank-item" key={row.team}>
          <span className="rnum">{index + 1}</span>
          <span className="rflag">{T[row.team].flag}</span>
          <span className="rname">{T[row.team].name.toUpperCase()}</span>
          <span className="rpct">{row.pts} pts</span>
        </div>
      ))}
    </>
  );

  const Round = ({ label, matches, winners }) => (
    <>
      <div className="brnd-lbl">{label}</div>
      {matches.map((m, i) => (
        <div className="bm" key={`${label}-${i}`}>
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
      <div className="sec-title">2026 WORLD CUP SIMULATION</div>

      <button
        className="action-btn"
        onClick={simulate}
        disabled={state === "loading"}
      >
        {state === "loading" ? "SIMULATING..." : "SIMULATE WORLD CUP ↗"}
      </button>

      {!bracket && state !== "loading" && !error && (
        <div className="result-empty">
          Simulate the 2026<br />World Cup from groups
        </div>
      )}

      {state === "loading" && (
        <div className="result-empty">
          Running group stage<br />and knockout simulation...
        </div>
      )}

      {error && (
  <div className="result-empty">
    TOURNAMENT ERROR<br />
    {error}
  </div>
)}

      {bracket && (
        <>
          <div className="sec-title">GROUP STAGE</div>

          {Object.entries(bracket.groupResults).map(([groupName, result]) => (
            <GroupTable
              key={groupName}
              groupName={groupName}
              result={result}
            />
          ))}

          <Round
            label="ROUND OF 32"
            matches={bracket.round32}
            winners={bracket.round32Winners}
          />

          <Round
            label="ROUND OF 16"
            matches={bracket.round16}
            winners={bracket.round16Winners}
          />

          <Round
            label="QUARTERFINALS"
            matches={bracket.quarterfinals}
            winners={bracket.quarterfinalWinners}
          />

          <Round
            label="SEMIFINALS"
            matches={bracket.semifinals}
            winners={bracket.semifinalWinners}
          />

          <Round
            label="FINAL"
            matches={bracket.final}
            winners={[bracket.champion]}
          />

          <div className="champion-box">
            <div className="champion-lbl">WORLD CHAMPION</div>
            <div className="champion-name">
              {T[bracket.champion].flag} {T[bracket.champion].name.toUpperCase()}
            </div>
          </div>

          <button
            className="action-btn"
            onClick={simulate}
            disabled={state === "loading"}
          >
            {state === "loading" ? "SIMULATING..." : "SIMULATE AGAIN ↗"}
          </button>
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

// ─── Main App ─────────────────────────────────────────────────────────────────
export default function App() {
  const [selA, setSelA] = useState(null);
  const [selB, setSelB] = useState(null);
  const [activeTab, setActiveTab] = useState("duel");

  const selectCountry = (code) => {
    if (selA === code || selB === code) return;
    if (!selA) setSelA(code);
    else if (!selB) setSelB(code);
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
              {["duel", "bracket", "teams"].map(tab => (
                <button key={tab} className={`tab-btn ${activeTab === tab ? "active" : ""}`} onClick={() => setActiveTab(tab)}>
                  {tab.toUpperCase()}
                </button>
              ))}
            </div>
            {activeTab === "duel" && (
              <DuelTab
                selA={selA} selB={selB}
                onClearA={() => setSelA(null)}
                onClearB={() => setSelB(null)}
              />
            )}
            {activeTab === "bracket" && <BracketTab />}
            {activeTab === "teams" && <RankingTab onSelect={selectFromRanking} />}
          </div>
        </div>
      </div>
    </>
  );
}
