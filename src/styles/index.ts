import type { StyleSpec } from "../config/types";
import s_nolli from "./nolli.json";
import s_sanborn from "./sanborn.json";
import s_snow from "./snow.json";
import s_booth from "./booth.json";
import s_ordnance from "./ordnance.json";
import s_beck from "./beck.json";
import s_vignelli from "./vignelli.json";
import s_blueprint from "./blueprint.json";
import s_cyanotype from "./cyanotype.json";
import s_soviet_topo from "./soviet-topo.json";
import s_bauhaus from "./bauhaus.json";
import s_art_deco from "./art-deco.json";
import s_ukiyo_e from "./ukiyo-e.json";
import s_stained_glass from "./stained-glass.json";
import s_starry_night from "./starry-night.json";
import s_risograph from "./risograph.json";
import s_linocut from "./linocut.json";
import s_pencil from "./pencil.json";
import s_watercolor from "./watercolor.json";
import s_pastel from "./pastel.json";
import s_sakura from "./sakura.json";
import s_solarpunk from "./solarpunk.json";
import s_dune from "./dune.json";
import s_nordic from "./nordic.json";
import s_toner from "./toner.json";
import s_night from "./night.json";
import s_neon from "./neon.json";
import s_gmaps_dark from "./gmaps-dark.json";
import s_search from "./search.json";
import s_drive from "./drive.json";
import s_here from "./here.json";
import s_synthwave from "./synthwave.json";
import s_brutalist from "./brutalist.json";
import s_circuit from "./circuit.json";
import s_8_bit from "./8-bit.json";
import s_solarized_light from "./solarized-light.json";
import s_solarized_dark from "./solarized-dark.json";
import s_heerhugowaard from "./heerhugowaard.json";
import s_peach from "./peach.json";
import s_auburn from "./auburn.json";
import s_citrus from "./citrus.json";

/** Style selected when the app opens. */
export const DEFAULT_STYLE_ID = "pencil";

// Order shown in the style picker; the prettymaps tributes sit at the end.
export const STYLES = [
  s_nolli,
  s_sanborn,
  s_snow,
  s_booth,
  s_ordnance,
  s_beck,
  s_vignelli,
  s_blueprint,
  s_cyanotype,
  s_soviet_topo,
  s_bauhaus,
  s_art_deco,
  s_ukiyo_e,
  s_stained_glass,
  s_starry_night,
  s_risograph,
  s_linocut,
  s_pencil,
  s_watercolor,
  s_pastel,
  s_sakura,
  s_solarpunk,
  s_dune,
  s_nordic,
  s_toner,
  s_night,
  s_neon,
  s_gmaps_dark,
  s_search,
  s_drive,
  s_here,
  s_synthwave,
  s_brutalist,
  s_circuit,
  s_8_bit,
  s_solarized_light,
  s_solarized_dark,
  s_heerhugowaard,
  s_peach,
  s_auburn,
  s_citrus,
] as StyleSpec[];
