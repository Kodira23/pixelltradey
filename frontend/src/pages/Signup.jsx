// Signup.jsx
import { useEffect, useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { supabase } from "../supabaseClient";
import logo from "../vanlogo.png";

// Flag images come from flagcdn.com so they also render on Windows (which has no flag emoji)
const flag = (code) => `https://flagcdn.com/w40/${code.toLowerCase()}.png`;

const COUNTRIES = `AF|Afghanistan|93
AX|Åland Islands|358
AL|Albania|355
DZ|Algeria|213
AS|American Samoa|1684
AD|Andorra|376
AO|Angola|244
AI|Anguilla|1264
AG|Antigua and Barbuda|1268
AR|Argentina|54
AM|Armenia|374
AW|Aruba|297
AU|Australia|61
AT|Austria|43
AZ|Azerbaijan|994
BS|Bahamas|1242
BH|Bahrain|973
BD|Bangladesh|880
BB|Barbados|1246
BY|Belarus|375
BE|Belgium|32
BZ|Belize|501
BJ|Benin|229
BM|Bermuda|1441
BT|Bhutan|975
BO|Bolivia|591
BQ|Caribbean Netherlands|599
BA|Bosnia and Herzegovina|387
BW|Botswana|267
BR|Brazil|55
IO|British Indian Ocean Territory|246
VG|British Virgin Islands|1284
BN|Brunei|673
BG|Bulgaria|359
BF|Burkina Faso|226
BI|Burundi|257
KH|Cambodia|855
CM|Cameroon|237
CA|Canada|1
CV|Cape Verde|238
KY|Cayman Islands|1345
CF|Central African Republic|236
TD|Chad|235
CL|Chile|56
CN|China|86
CX|Christmas Island|61
CC|Cocos (Keeling) Islands|61
CO|Colombia|57
KM|Comoros|269
CG|Congo|242
CD|DR Congo|243
CK|Cook Islands|682
CR|Costa Rica|506
CI|Côte d'Ivoire|225
HR|Croatia|385
CU|Cuba|53
CW|Curaçao|599
CY|Cyprus|357
CZ|Czechia|420
DK|Denmark|45
DJ|Djibouti|253
DM|Dominica|1767
DO|Dominican Republic|1809
EC|Ecuador|593
EG|Egypt|20
SV|El Salvador|503
GQ|Equatorial Guinea|240
ER|Eritrea|291
EE|Estonia|372
SZ|Eswatini|268
ET|Ethiopia|251
FK|Falkland Islands|500
FO|Faroe Islands|298
FJ|Fiji|679
FI|Finland|358
FR|France|33
GF|French Guiana|594
PF|French Polynesia|689
GA|Gabon|241
GM|Gambia|220
GE|Georgia|995
DE|Germany|49
GH|Ghana|233
GI|Gibraltar|350
GR|Greece|30
GL|Greenland|299
GD|Grenada|1473
GP|Guadeloupe|590
GU|Guam|1671
GT|Guatemala|502
GG|Guernsey|44
GN|Guinea|224
GW|Guinea-Bissau|245
GY|Guyana|592
HT|Haiti|509
HN|Honduras|504
HK|Hong Kong|852
HU|Hungary|36
IS|Iceland|354
IN|India|91
ID|Indonesia|62
IR|Iran|98
IQ|Iraq|964
IE|Ireland|353
IM|Isle of Man|44
IL|Israel|972
IT|Italy|39
JM|Jamaica|1876
JP|Japan|81
JE|Jersey|44
JO|Jordan|962
KZ|Kazakhstan|7
KE|Kenya|254
KI|Kiribati|686
XK|Kosovo|383
KW|Kuwait|965
KG|Kyrgyzstan|996
LA|Laos|856
LV|Latvia|371
LB|Lebanon|961
LS|Lesotho|266
LR|Liberia|231
LY|Libya|218
LI|Liechtenstein|423
LT|Lithuania|370
LU|Luxembourg|352
MO|Macao|853
MG|Madagascar|261
MW|Malawi|265
MY|Malaysia|60
MV|Maldives|960
ML|Mali|223
MT|Malta|356
MH|Marshall Islands|692
MQ|Martinique|596
MR|Mauritania|222
MU|Mauritius|230
YT|Mayotte|262
MX|Mexico|52
FM|Micronesia|691
MD|Moldova|373
MC|Monaco|377
MN|Mongolia|976
ME|Montenegro|382
MS|Montserrat|1664
MA|Morocco|212
MZ|Mozambique|258
MM|Myanmar|95
NA|Namibia|264
NR|Nauru|674
NP|Nepal|977
NL|Netherlands|31
NC|New Caledonia|687
NZ|New Zealand|64
NI|Nicaragua|505
NE|Niger|227
NG|Nigeria|234
NU|Niue|683
NF|Norfolk Island|672
KP|North Korea|850
MK|North Macedonia|389
MP|Northern Mariana Islands|1670
NO|Norway|47
OM|Oman|968
PK|Pakistan|92
PW|Palau|680
PS|Palestine|970
PA|Panama|507
PG|Papua New Guinea|675
PY|Paraguay|595
PE|Peru|51
PH|Philippines|63
PL|Poland|48
PT|Portugal|351
PR|Puerto Rico|1787
QA|Qatar|974
RE|Réunion|262
RO|Romania|40
RU|Russia|7
RW|Rwanda|250
BL|Saint Barthélemy|590
SH|Saint Helena|290
KN|Saint Kitts and Nevis|1869
LC|Saint Lucia|1758
MF|Saint Martin|590
PM|Saint Pierre and Miquelon|508
VC|Saint Vincent and the Grenadines|1784
WS|Samoa|685
SM|San Marino|378
ST|São Tomé and Príncipe|239
SA|Saudi Arabia|966
SN|Senegal|221
RS|Serbia|381
SC|Seychelles|248
SL|Sierra Leone|232
SG|Singapore|65
SX|Sint Maarten|1721
SK|Slovakia|421
SI|Slovenia|386
SB|Solomon Islands|677
SO|Somalia|252
ZA|South Africa|27
KR|South Korea|82
SS|South Sudan|211
ES|Spain|34
LK|Sri Lanka|94
SD|Sudan|249
SR|Suriname|597
SJ|Svalbard and Jan Mayen|47
SE|Sweden|46
CH|Switzerland|41
SY|Syria|963
TW|Taiwan|886
TJ|Tajikistan|992
TZ|Tanzania|255
TH|Thailand|66
TL|Timor-Leste|670
TG|Togo|228
TK|Tokelau|690
TO|Tonga|676
TT|Trinidad and Tobago|1868
TN|Tunisia|216
TR|Türkiye|90
TM|Turkmenistan|993
TC|Turks and Caicos Islands|1649
TV|Tuvalu|688
UG|Uganda|256
UA|Ukraine|380
AE|United Arab Emirates|971
GB|United Kingdom|44
US|United States|1
UY|Uruguay|598
VI|US Virgin Islands|1340
UZ|Uzbekistan|998
VU|Vanuatu|678
VA|Vatican City|379
VE|Venezuela|58
VN|Vietnam|84
WF|Wallis and Futuna|681
EH|Western Sahara|212
YE|Yemen|967
ZM|Zambia|260
ZW|Zimbabwe|263`
  .split("\n")
  .map((l) => {
    const [code, name, d] = l.split("|");
    return { code, name, dial: "+" + d };
  })
  .sort((a, b) => a.name.localeCompare(b.name));

export default function Signup() {
  const [country, setCountry] = useState("US");
  const [phone, setPhone] = useState("");
  const [confirm, setConfirm] = useState("");
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [info, setInfo] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const phoneRef = useRef(null);
  const selected = COUNTRIES.find((c) => c.code === country) ?? COUNTRIES[0];
  const dial = selected.dial;

  useEffect(() => {
    if (!open) return;
    const close = (e) => { if (!phoneRef.current?.contains(e.target)) setOpen(false); };
    const esc = (e) => { if (e.key === "Escape") setOpen(false); };
    document.addEventListener("mousedown", close);
    document.addEventListener("keydown", esc);
    return () => {
      document.removeEventListener("mousedown", close);
      document.removeEventListener("keydown", esc);
    };
  }, [open]);

  const q = query.trim().toLowerCase().replace(/^\+/, "");
  const list = q
    ? COUNTRIES.filter(
        (c) => c.name.toLowerCase().includes(q) || c.code.toLowerCase() === q || c.dial.slice(1).startsWith(q)
      )
    : COUNTRIES;

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setInfo("");
    if (password !== confirm) return setError("Passwords do not match.");
    setLoading(true);
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          username,
          phone: `${dial}${phone.replace(/\D/g, "")}`,
        },
      },
    });
    setLoading(false);
    if (error) return setError(error.message);
    if (data.session) {
      navigate("/dashboard");
    } else {
      setInfo("Check your email to confirm your account before logging in.");
    }
  }

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');

        /* Full-screen layer so nothing from the app layout (navbar, banners) shows above the card */
        .auth {
          --a-page: #0a0e1a;
          --a-card: #0e1424;
          --a-card-border: #1f2842;
          --a-input: #121a2e;
          --a-input-border: #262f4a;
          --a-text: #ffffff;
          --a-sub: #b3b9d1;
          --a-muted: #8a93b3;
          --a-accent: #5b6ef5;
          --a-err: #ff6b6b;
          --a-err-soft: rgba(255, 107, 107, 0.12);
          --a-ok: #35d0ba;
          --a-ok-soft: rgba(53, 208, 186, 0.12);

          position: fixed;
          inset: 0;
          z-index: 50;
          overflow-y: auto;
          display: flex;
          padding: 16px;
          background:
            radial-gradient(700px 420px at 82% 55%, rgba(91, 110, 245, 0.16), transparent 65%),
            radial-gradient(500px 360px at 20% 15%, rgba(91, 110, 245, 0.07), transparent 70%),
            var(--a-page);
          color: var(--a-text);
          font-family: 'Inter', system-ui, -apple-system, 'Segoe UI', Roboto, sans-serif;
          font-size: 14px;
        }

        /* Back link, top-left of the page */
        .auth__back {
          position: absolute;
          top: 12px;
          left: 20px;
          display: inline-flex;
          align-items: center;
          gap: 8px;
          font-size: 15px;
          line-height: 20px;
          color: var(--a-sub);
          text-decoration: none;
          z-index: 1;
        }
        .auth__back svg { width: 16px; height: 16px; }
        .auth__back:hover { color: var(--a-text); }
        .auth__back:focus-visible { outline: 2px solid var(--a-accent); outline-offset: 3px; border-radius: 4px; }

        /* Card: same size on sign in and sign up */
        .auth__card {
          width: 100%;
          max-width: 448px;
          margin: auto;
          flex-shrink: 0;
          display: grid;
          gap: 20px;
          background: var(--a-card);
          border: 1px solid var(--a-card-border);
          border-radius: 16px;
          padding: 24px;
        }

        .auth__logo { justify-self: center; display: block; }
        .auth__logo img {
          display: block;
          height: 90px;
          width: auto;
          max-width: 100%;
          object-fit: contain;
          mix-blend-mode: lighten; /* hides the logo's black background on the dark card */
        }

        .auth__head { text-align: center; display: grid; gap: 8px; margin: 8px 0 6px; }
        .auth__head h1 { margin: 0; font-size: 24px; font-weight: 600; letter-spacing: -0.03em; line-height: 1.2; color: var(--a-text); }
        .auth__head p { margin: 0; font-size: 14px; line-height: 20px; color: var(--a-sub); }

        /* Labels + inputs */
        .auth__field { position: relative; display: grid; gap: 8px; }
        .auth__card label {
          display: grid;
          gap: 8px;
          font-size: 14px;
          font-weight: 600;
          line-height: 20px;
          color: var(--a-text);
        }
        .auth__card input,
        .auth__card select {
          width: 100%;
          height: 40px;
          box-sizing: border-box;
          padding: 0 12px;
          background: var(--a-input);
          border: 1px solid var(--a-input-border);
          border-radius: 6px;
          color: var(--a-text);
          font-size: 14px;
          font-weight: 400;
          font-family: inherit;
        }
        .auth__card input::placeholder { color: var(--a-muted); }
        .auth__card input:focus,
        .auth__card select:focus { border-color: var(--a-accent); outline: none; }

        /* Phone: country select + dial code + number */
        .auth__label { font-size: 14px; font-weight: 600; line-height: 20px; color: var(--a-text); }
        .auth__phone { display: grid; grid-template-columns: 76px 1fr; gap: 8px; }
        .auth__country-btn { display: flex; align-items: center; justify-content: center; gap: 6px; width: 100%; height: 40px; padding: 0 8px; background: var(--a-input); border: 1px solid var(--a-input-border); border-radius: 6px; color: var(--a-sub); cursor: pointer; }
        .auth__country-btn:hover, .auth__country-btn[aria-expanded="true"] { border-color: var(--a-accent); }
        .auth__flag { display: block; flex: none; width: 20px; height: 15px; object-fit: cover; border-radius: 2px; }
        .auth__panel { position: absolute; left: 0; right: 0; top: 100%; margin-top: 6px; z-index: 5; padding: 8px; background: var(--a-card); border: 1px solid var(--a-card-border); border-radius: 10px; box-shadow: 0 20px 50px rgba(0, 0, 0, 0.5); }
        .auth__panel input { margin-bottom: 6px; }
        .auth__list { list-style: none; margin: 0; padding: 0; max-height: 220px; overflow-y: auto; }
        .auth__opt { display: flex; align-items: center; gap: 10px; width: 100%; padding: 8px; background: none; border: 0; border-radius: 6px; color: var(--a-text); font-family: inherit; font-size: 14px; text-align: left; cursor: pointer; }
        .auth__opt:hover, .auth__opt.is-sel { background: var(--a-input); }
        .auth__opt-name { flex: 1; min-width: 0; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
        .auth__opt-dial { color: var(--a-muted); font-size: 13px; }
        .auth__empty { padding: 10px 8px; color: var(--a-muted); font-size: 13px; }
        .auth__dial { display: flex; align-items: center; height: 40px; box-sizing: border-box; padding-left: 14px; background: var(--a-input); border: 1px solid var(--a-input-border); border-radius: 6px; }
        .auth__dial:focus-within { border-color: var(--a-accent); }
        .auth__dial span { font-size: 14px; color: var(--a-sub); padding-right: 12px; margin-right: 12px; border-right: 1px solid var(--a-input-border); line-height: 16px; }
        .auth__dial input { border: 0; background: transparent; height: 100%; padding: 0; border-radius: 0; }
        .auth__dial input:focus { border: 0; }

        /* Password field with show/hide toggle */
        .auth__pw { position: relative; }
        .auth__pw input { padding-right: 42px; }
        .auth__toggle {
          position: absolute;
          top: 0;
          right: 0;
          display: grid;
          place-items: center;
          width: 40px;
          height: 40px;
          padding: 0;
          background: none;
          border: 0;
          color: var(--a-muted);
          cursor: pointer;
        }
        .auth__toggle:hover { color: var(--a-text); }
        .auth__toggle:focus-visible { outline: 2px solid var(--a-accent); outline-offset: -2px; border-radius: 6px; }

        /* Submit */
        .auth__submit {
          background: var(--a-accent);
          color: #fff;
          font-family: inherit;
          font-weight: 500;
          font-size: 14px;
          height: 40px;
          border: 0;
          border-radius: 6px;
          margin-top: 4px;
          cursor: pointer;
        }
        .auth__submit:hover { filter: brightness(1.1); }
        .auth__submit:focus-visible { outline: 2px solid var(--a-text); outline-offset: 2px; }
        .auth__submit:disabled { opacity: 0.6; cursor: wait; }

        /* Messages */
        .auth__msg { padding: 10px 12px; border-radius: 6px; font-size: 13px; }
        .auth__msg--err { background: var(--a-err-soft); color: var(--a-err); }
        .auth__msg--ok { background: var(--a-ok-soft); color: var(--a-ok); }

        .auth__switch { text-align: center; color: var(--a-sub); font-size: 14px; margin-top: -4px; }
        .auth__switch a { color: var(--a-accent); font-weight: 500; text-decoration: none; }
        .auth__switch a:hover { text-decoration: underline; }

        /* Small screens: keep the card clear of the Back link */
        @media (max-width: 560px) {
          .auth { padding: 52px 12px 16px; }
          .auth__logo img { height: 80px; }
        }
      `}</style>

    <div className="auth">
      <Link to="/" className="auth__back">
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <path d="M19 12H5M12 19l-7-7 7-7" />
        </svg>
        Back
      </Link>

      <form className="auth__card" onSubmit={handleSubmit}>
        <Link to="/" className="auth__logo">
          <img src={logo} alt="VantyxTrade" />
        </Link>

        <div className="auth__head">
          <h1>Create an account</h1>
          <p>Start accumulating with VantyxTrade</p>
        </div>

        <label>
          Username
          <input
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            placeholder="yourname"
            autoComplete="username"
            required
          />
        </label>

        <label>
          Email
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@example.com"
            autoComplete="email"
            required
          />
        </label>

        <div className="auth__field" ref={phoneRef}>
          <span className="auth__label">Phone Number</span>
          <div className="auth__phone">
            <button
              type="button"
              className="auth__country-btn"
              onClick={() => setOpen((o) => !o)}
              aria-haspopup="listbox"
              aria-expanded={open}
              aria-label={`Country: ${selected.name}`}
            >
              <img className="auth__flag" src={flag(selected.code)} alt="" />
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <path d="M6 9l6 6 6-6" />
              </svg>
            </button>
            <div className="auth__dial">
              <span>{dial}</span>
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="(201) 555-0123"
                autoComplete="tel-national"
                aria-label="Phone number"
                required
              />
            </div>
          </div>
          {open && (
            <div className="auth__panel">
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search country or code"
                aria-label="Search countries"
                autoFocus
              />
              <ul className="auth__list" role="listbox">
                {list.map((c) => (
                  <li key={c.code}>
                    <button
                      type="button"
                      role="option"
                      aria-selected={c.code === country}
                      className={`auth__opt${c.code === country ? " is-sel" : ""}`}
                      onClick={() => { setCountry(c.code); setOpen(false); setQuery(""); }}
                    >
                      <img className="auth__flag" src={flag(c.code)} alt="" loading="lazy" />
                      <span className="auth__opt-name">{c.name}</span>
                      <span className="auth__opt-dial">{c.dial}</span>
                    </button>
                  </li>
                ))}
                {list.length === 0 && <li className="auth__empty">No matching country</li>}
              </ul>
            </div>
          )}
        </div>

        <div className="auth__field">
          <label htmlFor="password">Password</label>
          <div className="auth__pw">
            <input
              id="password"
              type={showPassword ? "text" : "password"}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Create a password"
              autoComplete="new-password"
              required
              minLength={6}
            />
            <button
              type="button"
              className="auth__toggle"
              onClick={() => setShowPassword((s) => !s)}
              aria-label={showPassword ? "Hide password" : "Show password"}
            >
              {showPassword ? (
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M9.88 9.88a3 3 0 1 0 4.24 4.24" />
                  <path d="M10.73 5.08A10.43 10.43 0 0 1 12 5c7 0 10 7 10 7a13.16 13.16 0 0 1-1.67 2.68" />
                  <path d="M6.61 6.61A13.526 13.526 0 0 0 2 12s3 7 10 7a9.74 9.74 0 0 0 5.39-1.61" />
                  <path d="m2 2 20 20" />
                </svg>
              ) : (
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z" />
                  <circle cx="12" cy="12" r="3" />
                </svg>
              )}
            </button>
          </div>
        </div>

        <label>
          Confirm Password
          <input
            type={showPassword ? "text" : "password"}
            value={confirm}
            onChange={(e) => setConfirm(e.target.value)}
            placeholder="Confirm your password"
            autoComplete="new-password"
            required
            minLength={6}
          />
        </label>

        {error && <div className="auth__msg auth__msg--err" role="alert">{error}</div>}
        {info && <div className="auth__msg auth__msg--ok">{info}</div>}

        <button className="auth__submit" disabled={loading}>
          {loading ? "Creating account…" : "Register"}
        </button>

        <div className="auth__switch">
          Already have an account? <Link to="/login">Sign in</Link>
        </div>
      </form>
    </div>
    </>
  );
}
