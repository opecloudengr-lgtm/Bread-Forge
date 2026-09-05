export const siteConfig = {
  name: "The Bread Forge",
  ministry: "Adullam Cave Christian Network",
  shortMinistry: "ACCN",
  mandateVerse: "‘To make ready a people prepared for the LORD.’",
  mandateReferences: "Luke 1:17 · Jeremiah 51:20 · 1 Samuel 22:1-2",
  address: "The House of His Glory Event Centre, MFM Junction, Tanke, Ilorin, Nigeria",
  phone: "0913 288 6962",
  serviceTimes: [
    { day: "Wednesday", time: "5:00 PM — Worship Service" },
    { day: "Sunday", time: "2:30 PM — Worship Service" },
  ],
  socials: [
    { label: "WhatsApp", href: "https://chat.whatsapp.com/IEFI4QVEFjy7jmQZKnf3Eu?s=cl&p=a&ilr=1" },
    { label: "Facebook", href: "https://www.facebook.com/share/1EhAyTTVAy/" },
    { label: "Instagram", href: "https://www.instagram.com/accn.global?igsi=M2xnbXVsb2lqYWJ6" },
    { label: "Telegram", href: "https://t.me/ACCNGLOBAL" },
    { label: "YouTube", href: "https://youtube.com/@accnglobal?si=mpjoenVZIuHOZVYo" },
    { label: "Mixlr", href: "https://accnglobal.mixlr.com/" },
    {
      label: "Spotify",
      href: "https://open.spotify.com/show/0pz461SvbXBwSFVV1d9BQO?utm_source=ig&utm_medium=social&utm_content=link_in_bio",
    },
  ],
  whatsappCommunity: "https://chat.whatsapp.com/IEFI4QVEFjy7jmQZKnf3Eu?s=cl&p=a&ilr=1",
  partnerFormUrl:
    "https://docs.google.com/forms/d/e/1FAIpQLSdaJ4gmkJtRAOMmTN-QU8n-fFdZRdQcU25640Wotb7fIw4_xg/viewform?pli=1",
  nav: [
    { label: "Home", href: "/" },
    { label: "About", href: "/about" },
    { label: "Sermons", href: "/sermons" },
    { label: "Events", href: "/events" },
    { label: "Gallery", href: "/gallery" },
    { label: "Partnership", href: "/partnership" },
    { label: "Contact", href: "/contact" },
  ],
};

export const givingInfo = {
  bankName: "Access Bank",
  accounts: [
    { currency: "Naira", number: "1875047356" },
    { currency: "Dollar", number: "1878251437" },
  ],
  sortCode: "044141404",
  swiftCode: "ABNGNGLA",
  givingNote:
    "Please let your givings have a title, so we know what you are giving for and it can be used solely for that purpose.",
  blessing: "The LORD Bless You, in JESUS name.",
  projectUpdate:
    "The Bread Forge — our new digital home for sermons, events, and discipleship resources — is now live. Thank you to every Adullam Kingdom Steward whose partnership made this build possible. The next phase focuses on expanding our media archive and community outreach programs.",
};

// `summary` is shown in compact card grids (e.g. the Home page); `full` is
// the complete text shown on the About page and falls back to `summary`
// when a pillar hasn't been given its own longer write-up yet.
export const pillars: { name: string; summary: string; full?: string }[] = [
  {
    name: "Prayer",
    summary:
      "A ministry rooted in unceasing prayer and warfare intercession, contending for the mandate in the secret place before it is seen in public.",
  },
  {
    name: "Worship",
    summary:
      "Wholehearted worship that ushers the presence of God and forms a people who carry His glory into every sphere of life.",
  },
  {
    name: "Word",
    summary:
      "Sound, Spirit-illuminated teaching and preaching of the Gospel of the Kingdom that builds disciples, not just attendees.",
  },
  {
    name: "Participation",
    summary:
      "Every member serving with their gifts — a family of active participants rather than passive spectators.",
  },
  {
    name: "Partnership",
    summary:
      "Adullam Kingdom Stewards (AKS) — a company of proactive givers and benefactors who fund and sustain the work of the Kingdom.",
  },
  {
    name: "Propagation",
    summary:
      "Every member is called to broadcast the Gospel of the Kingdom through their own sphere of influence — online and in person — because the mandate is a family mission, not a marketing campaign.",
    full: `We are not a for-profit organisation; Ours is kingdom business whose business model is not earthly. Our profit happens as the ones sent to us begin to consciously accept JESUS as their LORD, and begin to consciously live a life consistent with the Kingdom.

We do not use carefully algorithmised mass media marketing tactics; thoroughly perfected public relations techniques and well-tested social engineering and manipulation formulas to announce ourselves and/or appeal to people. We completely rely on the LORD to quicken the hearts of all those who have been committed to us for oversight to get the vision and run with it. This is why everyone who is in the network is expected to propagate the content of the message GOD has given to us.

It's simple: use your timelines, social media handles, influence, social opportunities and every resource at your disposal to broadcast the message on the streets and cyberspace. We are not a cult, we are a family; we are not a club, we are a community; and it is neither about us nor any single person; it is and shall always be about the KING and HIS kingdom! The work will not be complete if you do not permeate your sphere of contact with the message!!`,
  },
  {
    name: "Community Lifestyle",
    summary:
      "A community whose everyday conduct — internally and externally — visibly expresses the righteousness and family we represent (Hosea 10:12).",
    full: "As a community of men whose lives are directed by the affairs of GOD, we are expected to live by the standards of righteousness as we deal with people, both internally and externally (Hosea 10:12). Your life is supposed to be another platform that expresses visibly who we are and what we represent.",
  },
];
