import { useNavigate } from "react-router-dom";
import Gun1 from "../../assets/image/Gun.png";
import Natasha1 from "../../assets/image/Natasha.png";
import Fias1 from "../../assets/image/Fias.png";

const TEAM_MEMBERS = [
  {
    name: "Gunthee Kanjanawattanakul",
    role: "Machine Learning Engineer",
    photo: Gun1,
    photoPosition: "center 18%",
  },
  {
    name: "Natasha Lertsansiri",
    role: "Leader & AI Engineer",
    photo: Natasha1,
    photoPosition: "center 38%",
  },
  {
    name: "Thanathon Satthayaphan",
    role: "Dev Ops Engineer",
    photo: Fias1,
    photoPosition: "center 58%",
  },
];

export default function AboutUs() {
  const navigate = useNavigate();

  return (
    <div className="about-page">
      <style>{`
        .about-page {
          min-height: 889px;
          padding: 0;
          /* background: #2454e4; */
          background: rgba(10, 14, 26, 0.09); /* 0.5 = โปร่ง 50% */
          font-family: "Sora", "Avenir Next", "Trebuchet MS", sans-serif;
        }
        .about-container {
          max-width: 1200px;
          margin: 0 auto;
          padding: 56px 24px 0 24px;
        }
        .about-head {
          display: flex;
          align-items: flex-end;
          justify-content: space-between;
          gap: 32px;
        }
        .about-kicker {
          font-size: 13px;
          letter-spacing: 0.12em;
          text-transform: uppercase;
          color: #a2abd6;
          margin-bottom: 12px;
        }
        .about-title {
          font-size: 48px;
          font-weight: 700;
          letter-spacing: -0.02em;
          color: #fff;
          margin: 0 0 0 0;
        }
        .about-title .highlight {
          color: #b6aaff;
        }
        .about-desc {
          max-width: 600px;
          font-size: 10px;
          color: #b9c0e6;
          margin-left: 32px;
        }
        .about-grid {
          margin-top: 54px;
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
          gap: 32px;
        }
        .about-card {
          background: linear-gradient(160deg, #20202042 60%, #0f0e1f 100%);
          border-radius: 18px;
          border: 1px solid rgba(216, 216, 216, 0.59);
          box-shadow: 0 6px 32px 0 rgba(255, 255, 255, 0.25);
          padding: 0;
          overflow: hidden;
          min-height: 490px;
          position: relative;
        }

        .about-photo {
          position: absolute;   /* ← เปลี่ยน */
          inset: 0;             /* ← top/right/bottom/left: 0 */
          width: 100%;
          height: 100%;
          background: #13131367;
          overflow: hidden;
        }

        .about-photo img {
          width: 100%;
          height: 100%;
          object-fit: cover;
          object-position: center;
          display: block;
        }
        .about-overlay {
          position: absolute;
          left: 14px;
          right: 14px;
          bottom: 14px;
          padding: 0;
          z-index: 1;
        }
        .about-name {
          font-size: 20px;
          font-weight: 600;
          color: #fff;
          margin: 0;
          text-shadow: 0 2px 14px rgba(0, 0, 0, 0.72);
        }
        .about-role {
          font-size: 12px;
          font-weight: 500;
          letter-spacing: 0.05em;
          color: #c8cef4;
          margin: 6px 0 0 0;
          text-transform: uppercase;
          text-shadow: 0 2px 12px rgba(0, 0, 0, 0.68);
        }
        @media (max-width: 900px) {
          .about-head { flex-direction: column; align-items: flex-start; gap: 18px; }
          .about-desc { margin-left: 0; }
        }
        @media (max-width: 600px) {
          .about-container { padding: 32px 6px 0 6px; }
          .about-title { font-size: 26px; }
          .about-grid { gap: 16px; }
        }
      `}</style>

      <div className="about-page">
        <div className="about-container">
          <div className="about-head">
            <div>
              <div className="about-kicker">[ PROBE SCURUTINY ]</div>
              <h1 className="about-title">Meet<span className="highlight"> OUR TEAM</span></h1>
            </div>
            <div className="about-desc">
              Our AI-driven automation eliminates busywork, streamlines your operations, and helps your business grow, without extra effort.
            </div>
          </div>
          <div className="about-grid" style={{color:'#ffffff'}}>
            {TEAM_MEMBERS.map((member) => (
              <article className="about-card" key={member.name}>
                <div className="about-photo">
                  <img
                    src={member.photo}
                    alt={member.name}
                    style={{ objectPosition: member.photoPosition }}
                  />
                  <div className="about-overlay">
                    <div className="about-name">{member.name}</div>
                    <div className="about-role">{member.role}</div>
                  </div>
                </div>
              </article>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
