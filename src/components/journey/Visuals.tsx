// Illustrations for the journey film. Pure SVG: the film's timeline animates parts by class:
//   .draw   strokes that draw in (pathLength=1, so dash maths stays simple)
//   .pop    pieces that scale in
//   .flow   dashed overlays that keep moving, like data on a wire (CSS)
//   .mover  an element the timeline moves along the path named in data-route
//   .pod    container boxes that appear one by one
import type { JourneyScene } from "@/content/profile";

const stroke = { fill: "none", strokeLinecap: "round", strokeLinejoin: "round" } as const;

function Network() {
  const nodes: [number, number][] = [
    [90, 140],
    [210, 90],
    [330, 150],
    [450, 80],
    [520, 190],
    [150, 240],
    [300, 260],
    [430, 270],
  ];
  const links: [number, number][] = [
    [0, 1],
    [1, 2],
    [2, 3],
    [3, 4],
    [0, 5],
    [5, 6],
    [6, 2],
    [6, 7],
    [7, 4],
    [1, 5],
    [2, 7],
  ];
  const tower = (x: number) => (
    <g key={x} className="draw-group">
      <path
        className="draw"
        pathLength={1}
        d={`M${x - 26} 400 L${x} 300 L${x + 26} 400 M${x - 16} 362 L${x + 16} 362 M${x - 9} 334 L${x + 9} 334 M${x} 300 L${x} 286`}
        stroke="var(--line-strong)"
        strokeWidth={2}
        {...stroke}
      />
      <circle className="pop" cx={x} cy={284} r={5} fill="var(--accent)" />
    </g>
  );
  return (
    <svg viewBox="0 0 600 420" className="size-full" aria-hidden>
      {links.map(([a, b]) => (
        <g key={`${a}-${b}`}>
          <path
            className="draw"
            pathLength={1}
            d={`M${nodes[a][0]} ${nodes[a][1]} L${nodes[b][0]} ${nodes[b][1]}`}
            stroke="var(--line-strong)"
            strokeWidth={1.5}
            {...stroke}
          />
          <path
            className="flow"
            d={`M${nodes[a][0]} ${nodes[a][1]} L${nodes[b][0]} ${nodes[b][1]}`}
            stroke="var(--cool)"
            strokeWidth={2}
            {...stroke}
          />
        </g>
      ))}
      {nodes.map(([x, y], i) => (
        <g key={i} className="pop" style={{ transformOrigin: `${x}px ${y}px` }}>
          <circle cx={x} cy={y} r={11} fill="var(--bg)" stroke="var(--cool)" strokeWidth={2} />
          <circle cx={x} cy={y} r={3.5} fill={i % 3 === 0 ? "var(--accent)" : "var(--cool)"} />
        </g>
      ))}
      {[110, 300, 490].map(tower)}
      {/* NOC dashboard */}
      <g className="pop" style={{ transformOrigin: "520px 330px" }}>
        <rect
          x={455}
          y={300}
          width={130}
          height={86}
          rx={10}
          fill="var(--surface)"
          stroke="var(--line-strong)"
        />
        <text x={467} y={320} fill="var(--muted)" fontSize={11} fontFamily="var(--font-mono)">
          NOC · live
        </text>
        {[26, 44, 34, 58, 40, 64].map((h, i) => (
          <rect
            key={i}
            className="bar"
            x={468 + i * 18}
            y={376 - h}
            width={10}
            height={h}
            rx={2}
            fill={i === 5 ? "var(--accent)" : "var(--cool)"}
            style={{ transformOrigin: `0 376px` }}
          />
        ))}
      </g>
    </svg>
  );
}

function Security() {
  const services = ["auth", "payments", "bounty", "ctf", "jobs"];
  return (
    <svg viewBox="0 0 600 420" className="size-full" aria-hidden>
      {/* event bus */}
      <path
        className="draw"
        pathLength={1}
        d="M40 350 L560 350"
        stroke="var(--line-strong)"
        strokeWidth={3}
        {...stroke}
      />
      <path
        className="flow"
        d="M40 350 L560 350"
        stroke="var(--accent)"
        strokeWidth={3}
        {...stroke}
      />
      <text x={44} y={378} fill="var(--muted)" fontSize={12} fontFamily="var(--font-mono)">
        kafka · rabbitmq
      </text>
      {services.map((s, i) => {
        const x = 70 + i * 112;
        return (
          <g key={s}>
            <path
              className="draw"
              pathLength={1}
              d={`M${x + 40} 300 L${x + 40} 350`}
              stroke="var(--line-strong)"
              strokeWidth={1.5}
              {...stroke}
            />
            <g className="pop" style={{ transformOrigin: `${x + 40}px 280px` }}>
              <rect
                x={x}
                y={262}
                width={80}
                height={38}
                rx={9}
                fill="var(--surface)"
                stroke="var(--cool)"
                strokeWidth={1.5}
              />
              <text
                x={x + 40}
                y={286}
                textAnchor="middle"
                fill="var(--fg)"
                fontSize={12}
                fontFamily="var(--font-mono)"
              >
                {s}
              </text>
            </g>
          </g>
        );
      })}
      {/* shield + lock */}
      <path
        className="draw"
        pathLength={1}
        d="M300 40 L380 70 L380 140 C380 190 345 220 300 238 C255 220 220 190 220 140 L220 70 Z"
        stroke="var(--cool)"
        strokeWidth={3}
        {...stroke}
      />
      <g className="pop" style={{ transformOrigin: "300px 140px" }}>
        <rect x={276} y={132} width={48} height={40} rx={6} fill="var(--accent)" />
        <path
          d="M286 132 v-12 a14 14 0 0 1 28 0 v12"
          stroke="var(--accent)"
          strokeWidth={5}
          {...stroke}
        />
        <circle cx={300} cy={150} r={5} fill="var(--accent-ink)" />
      </g>
      {/* an attack that stops at the shield */}
      <path id="attack-route" d="M40 40 C120 60 170 90 214 118" fill="none" />
      <g className="mover" data-route="#attack-route">
        <circle r={8} fill="#ef4444" />
        <circle r={14} fill="none" stroke="#ef4444" strokeOpacity={0.4} />
      </g>
      <g className="pop blocked" style={{ transformOrigin: "214px 118px" }}>
        <circle cx={214} cy={118} r={16} fill="var(--bg)" stroke="#ef4444" strokeWidth={2} />
        <path
          d="M207 111 L221 125 M221 111 L207 125"
          stroke="#ef4444"
          strokeWidth={2.5}
          {...stroke}
        />
      </g>
    </svg>
  );
}

function Cloud() {
  const pods = Array.from(
    { length: 12 },
    (_, i) => [348 + (i % 4) * 52, 168 + Math.floor(i / 4) * 52] as const,
  );
  return (
    <svg viewBox="0 0 600 420" className="size-full" aria-hidden>
      {/* chat */}
      {[
        { y: 70, w: 170, me: false },
        { y: 130, w: 130, me: true },
        { y: 190, w: 190, me: false },
      ].map((b, i) => (
        <g
          key={i}
          className="pop"
          style={{ transformOrigin: `${b.me ? 260 : 40}px ${b.y + 20}px` }}
        >
          <rect
            x={b.me ? 250 - b.w : 30}
            y={b.y}
            width={b.w}
            height={44}
            rx={16}
            fill={b.me ? "var(--accent)" : "var(--surface)"}
            stroke={b.me ? "none" : "var(--line-strong)"}
          />
          <rect
            x={(b.me ? 250 - b.w : 30) + 16}
            y={b.y + 15}
            width={b.w * 0.6}
            height={6}
            rx={3}
            fill={b.me ? "var(--accent-ink)" : "var(--muted)"}
            opacity={0.7}
          />
          <rect
            x={(b.me ? 250 - b.w : 30) + 16}
            y={b.y + 26}
            width={b.w * 0.35}
            height={6}
            rx={3}
            fill={b.me ? "var(--accent-ink)" : "var(--muted)"}
            opacity={0.5}
          />
        </g>
      ))}
      <text x={30} y={268} fill="var(--muted)" fontSize={12} fontFamily="var(--font-mono)">
        ai chatbot · django
      </text>
      {/* cluster */}
      <path
        className="draw"
        pathLength={1}
        d="M330 330 L560 330 C590 330 590 280 560 276 C565 230 515 210 490 236 C475 180 395 180 385 236 C345 226 320 256 330 290 C300 296 300 330 330 330 Z"
        stroke="var(--cool)"
        strokeWidth={2.5}
        {...stroke}
      />
      <text x={340} y={358} fill="var(--muted)" fontSize={12} fontFamily="var(--font-mono)">
        k8s · autoscale
      </text>
      {pods.map(([x, y], i) => (
        <rect
          key={i}
          className="pod"
          x={x}
          y={y - 6}
          width={36}
          height={36}
          rx={7}
          fill="var(--surface)"
          stroke={i < 2 ? "var(--accent)" : "var(--cool)"}
          strokeWidth={1.5}
          style={{ transformOrigin: `${x + 18}px ${y + 12}px` }}
        />
      ))}
      {/* news ticker */}
      <g className="pop" style={{ transformOrigin: "140px 360px" }}>
        <rect
          x={30}
          y={340}
          width={250}
          height={34}
          rx={8}
          fill="var(--surface)"
          stroke="var(--line-strong)"
        />
        <circle cx={48} cy={357} r={5} fill="#ef4444" />
        <rect x={62} y={353} width={190} height={8} rx={4} fill="var(--muted)" opacity={0.6} />
      </g>
    </svg>
  );
}

function Autonomy() {
  const floor = Array.from({ length: 7 }, (_, i) => i);
  return (
    <svg viewBox="0 0 600 420" className="size-full" aria-hidden>
      {/* perspective floor */}
      {floor.map((i) => (
        <path
          key={`h${i}`}
          className="draw"
          pathLength={1}
          d={`M${40 - i * 4} ${250 + i * 26} L${560 + i * 4} ${250 + i * 26}`}
          stroke="var(--line)"
          strokeWidth={1}
          {...stroke}
        />
      ))}
      {floor.map((i) => (
        <path
          key={`v${i}`}
          className="draw"
          pathLength={1}
          d={`M${120 + i * 60} 250 L${40 + i * 87} 410`}
          stroke="var(--line)"
          strokeWidth={1}
          {...stroke}
        />
      ))}
      {/* route with waypoints */}
      <path
        id="drone-route"
        className="draw"
        pathLength={1}
        d="M70 380 C150 300 200 360 270 300 S390 230 430 280 S520 330 545 255"
        stroke="var(--accent)"
        strokeWidth={2.5}
        strokeDasharray="1"
        {...stroke}
      />
      {[
        [70, 380],
        [270, 300],
        [430, 280],
        [545, 255],
      ].map(([x, y], i) => (
        <g key={i} className="pop" style={{ transformOrigin: `${x}px ${y}px` }}>
          <circle cx={x} cy={y} r={9} fill="var(--bg)" stroke="var(--accent)" strokeWidth={2} />
          <circle cx={x} cy={y} r={3} fill="var(--accent)" />
        </g>
      ))}
      <g className="mover" data-route="#drone-route">
        <g transform="translate(-22 -14)">
          <rect x={14} y={10} width={16} height={8} rx={3} fill="var(--fg)" />
          <path
            d="M4 6 H16 M28 6 H40 M10 6 V12 M34 6 V12"
            stroke="var(--fg)"
            strokeWidth={2.5}
            {...stroke}
          />
          <circle cx={22} cy={20} r={2.5} fill="var(--cool)" />
        </g>
      </g>
      {/* radar */}
      <g className="pop" style={{ transformOrigin: "500px 110px" }}>
        <circle cx={500} cy={110} r={70} fill="none" stroke="var(--line-strong)" />
        <circle cx={500} cy={110} r={45} fill="none" stroke="var(--line)" />
        <circle cx={500} cy={110} r={20} fill="none" stroke="var(--line)" />
        <g className="radar-sweep" style={{ transformOrigin: "500px 110px" }}>
          <path d="M500 110 L570 110 A70 70 0 0 0 549.5 60.5 Z" fill="var(--cool)" opacity={0.25} />
          <path d="M500 110 L570 110" stroke="var(--cool)" strokeWidth={2} />
        </g>
        <circle cx={530} cy={84} r={4} fill="var(--accent)" />
      </g>
      {/* spend under a budget guardrail */}
      <g className="pop" style={{ transformOrigin: "140px 120px" }}>
        <rect
          x={40}
          y={40}
          width={210}
          height={130}
          rx={12}
          fill="var(--surface)"
          stroke="var(--line-strong)"
        />
        <text x={56} y={64} fill="var(--muted)" fontSize={11} fontFamily="var(--font-mono)">
          cloud spend · guardrail
        </text>
        <path d="M56 92 L234 92" stroke="var(--accent)" strokeWidth={1.5} strokeDasharray="5 5" />
        <path
          className="draw"
          pathLength={1}
          d="M56 150 L86 134 L116 140 L146 118 L176 126 L206 110 L234 116"
          stroke="var(--cool)"
          strokeWidth={2.5}
          {...stroke}
        />
      </g>
    </svg>
  );
}

export function JourneyVisual({ kind }: { kind: JourneyScene["visual"] }) {
  if (kind === "network") return <Network />;
  if (kind === "security") return <Security />;
  if (kind === "cloud") return <Cloud />;
  return <Autonomy />;
}
