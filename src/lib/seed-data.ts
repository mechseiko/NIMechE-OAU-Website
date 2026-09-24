import { COL, fetchAll, fetchOne, setDocAt } from "./db";
import type { SiteSettings, TechnicalDivision } from "@/types";

/** The seven NIMechE technical divisions. Ids are stable (the division code)
 *  so re-seeding is idempotent and never duplicates. All fields remain fully
 *  editable from the admin dashboard afterwards. */
export const DEFAULT_DIVISIONS: TechnicalDivision[] = [
  {
    id: "THS",
    slug: "ths",
    code: "THS",
    name: "Thermal & Heat Systems",
    description:
      "Thermodynamics, heat transfer, HVAC and refrigeration, power plant engineering and energy systems.",
    focusAreas: ["Thermodynamics", "Heat Transfer", "HVAC & Refrigeration", "Power Plants"],
    coordinator: "",
  },
  {
    id: "EPS",
    slug: "eps",
    code: "EPS",
    name: "Energy & Power Systems",
    description:
      "Renewable and conventional energy generation, power systems, sustainability and energy policy.",
    focusAreas: ["Renewable Energy", "Power Systems", "Sustainability", "Energy Policy"],
    coordinator: "",
  },
  {
    id: "HRS",
    slug: "hrs",
    code: "HRS",
    name: "Hydraulics & Robotics Systems",
    description:
      "Fluid power, hydraulics and pneumatics, robotics, mechatronics and control of mechanical systems.",
    focusAreas: ["Hydraulics & Pneumatics", "Robotics", "Mechatronics", "Fluid Power"],
    coordinator: "",
  },
  {
    id: "AES",
    slug: "aes",
    code: "AES",
    name: "Automotive Engineering Systems",
    description:
      "Vehicle design, automotive powertrain, electric mobility, chassis and transport systems.",
    focusAreas: ["Vehicle Design", "Powertrain", "Electric Mobility", "Transport Systems"],
    coordinator: "",
  },
  {
    id: "MCS",
    slug: "mcs",
    code: "MCS",
    name: "Manufacturing & Control Systems",
    description:
      "Manufacturing processes, CAD/CAM, automation, industrial control and production engineering.",
    focusAreas: ["Manufacturing Processes", "CAD/CAM", "Automation", "Production Engineering"],
    coordinator: "",
  },
  {
    id: "CSD",
    slug: "csd",
    code: "CSD",
    name: "Computational & Simulation Division",
    description:
      "Numerical methods, finite element analysis, CFD, modelling and simulation of engineering systems.",
    focusAreas: ["Finite Element Analysis", "CFD", "Numerical Methods", "Simulation"],
    coordinator: "",
  },
  {
    id: "MPD",
    slug: "mpd",
    code: "MPD",
    name: "Materials & Production Design",
    description:
      "Engineering materials, metallurgy, failure analysis, product design and development.",
    focusAreas: ["Materials Science", "Metallurgy", "Failure Analysis", "Product Design"],
    coordinator: "",
  },
];

export const DEFAULT_SETTINGS: SiteSettings = {
  id: "site",
  siteName: "NIMechE OAU-SC",
  tagline: "Nigerian Institution of Mechanical Engineers — OAU Students' Chapter",
  heroTitle: "Building the next generation of mechanical engineers",
  heroSubtitle:
    "The students' chapter of the Nigerian Institution of Mechanical Engineers at Obafemi Awolowo University — engineering excellence, professional growth and community.",
  announcement: "",
  announcementActive: false,
  aboutMission:
    "To advance mechanical engineering education and practice among students of Obafemi Awolowo University through training, projects, mentorship and professional development.",
  aboutVision:
    "To be a leading student chapter that produces competent, ethical and innovative mechanical engineers who serve Nigeria and the world.",
  values: ["Excellence", "Integrity", "Innovation", "Service", "Teamwork"],
  historyText:
    "The chapter traces its roots from MESA (Mechanical Engineering Students' Association) to the NIMechE OAU Students' Chapter, representing mechanical engineering students at Obafemi Awolowo University.",
  constitutionUrl: "",
  contactEmail: "",
  contactPhone: "",
  contactAddress: "Department of Mechanical Engineering, Obafemi Awolowo University, Ile-Ife, Nigeria.",
  socials: [],
  currentAdministration: "",
  stats: [
    { label: "Technical Divisions", value: "7" },
    { label: "Students", value: "500+" },
    { label: "Years of Excellence", value: "40+" },
  ],
};

export interface SeedResult {
  divisions: number;
  settings: boolean;
}

/** Writes starter content only where it's missing — safe to run repeatedly.
 *  Requires a signed-in super_admin/admin (Firestore rules gate the writes). */
export async function seedDefaults(): Promise<SeedResult> {
  let divisionsWritten = 0;
  const existingDivisions = await fetchAll<TechnicalDivision>(COL.divisions);
  if (existingDivisions.length === 0) {
    for (const division of DEFAULT_DIVISIONS) {
      await setDocAt(COL.divisions, division.id, division as never);
      divisionsWritten += 1;
    }
  }

  let settingsWritten = false;
  const existingSettings = await fetchOne<SiteSettings>(COL.settings, "site");
  if (!existingSettings) {
    await setDocAt(COL.settings, "site", DEFAULT_SETTINGS as never);
    settingsWritten = true;
  }

  return { divisions: divisionsWritten, settings: settingsWritten };
}
