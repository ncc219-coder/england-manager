window.NATIONS = {
  "N. Ireland":     { short:"NIR", ratings:{1986:72,1990:68,1994:65,1996:64,1998:62,2000:61} },
  "Yugoslavia":     { short:"YUG", ratings:{1986:78,1990:79} },
  "Serbia":         { short:"SRB", ratings:{1994:70,1998:74,2002:72,2006:73,2010:70,2014:68,2018:70,2022:72} },
  "Spain":          { short:"ESP", ratings:{1986:80,1990:82,1994:83,1996:82,1998:83,2000:84,2002:84,2006:87,2010:94,2014:90,2018:88,2022:86} },
  "Turkey":         { short:"TUR", ratings:{1986:68,1990:67,1994:68,1996:70,1998:72,2002:76,2006:72,2010:70} },
  "Brazil":         { short:"BRA", ratings:{1986:92,1990:90,1994:93,1996:90,1998:91,2002:94,2006:88,2010:86,2014:86,2018:86,2022:87} },
  "West Germany":   { short:"WGR", ratings:{1986:90,1990:91} },
  "Germany":        { short:"GER", ratings:{1992:86,1994:88,1996:86,2002:88,2006:86,2010:88,2014:93,2018:86,2022:84} },
  "France":         { short:"FRA", ratings:{1986:84,1990:83,1994:84,1998:92,2000:90,2006:89,2010:82,2018:90,2022:90} },
  "Italy":          { short:"ITA", ratings:{1986:88,1990:90,1994:89,1998:88,2006:91,2010:84,2014:84,2018:78,2022:86} },
  "Argentina":      { short:"ARG", ratings:{1986:92,1990:88,1994:86,1998:87,2002:84,2006:85,2014:88,2018:84,2022:88} },
  "Netherlands":    { short:"NED", ratings:{1986:84,1990:88,1994:85,1998:88,2006:84,2010:88,2014:88,2022:85} },
  "Portugal":       { short:"POR", ratings:{1986:78,1990:76,1998:82,2004:86,2006:88,2010:86,2018:86,2022:86} },
  "Denmark":        { short:"DEN", ratings:{1986:75,1990:76,1992:82,1998:78,2002:79,2006:76,2021:84} },
  "Sweden":         { short:"SWE", ratings:{1986:76,1990:77,1994:82,1998:79,2002:80,2006:79,2018:78} },
  "Poland":         { short:"POL", ratings:{1986:74,1990:73,2006:74,2018:78,2022:76} },
  "Croatia":        { short:"CRO", ratings:{1996:80,1998:82,2006:79,2018:82,2022:82} },
  "Czech Rep":      { short:"CZE", ratings:{1994:80,1996:82,2000:79,2004:80,2006:78} },
  "Belgium":        { short:"BEL", ratings:{1986:80,1990:78,2014:84,2018:88,2022:86} },
  "Scotland":       { short:"SCO", ratings:{1986:76,1990:75,1996:72,2020:72,2024:74} },
  "Wales":          { short:"WAL", ratings:{2016:76,2022:76,2024:74} },
  "Hungary":        { short:"HUN", ratings:{1986:74,1990:72} },
  "Republic of Ireland": { short:"IRL", ratings:{1986:74,1988:76,1990:78,1994:75,2002:74} },
  "Soviet Union":   { short:"URS", ratings:{1986:86,1988:86,1990:84} },
  "Romania":        { short:"ROM", ratings:{1986:74,1990:76,1994:80,1998:80} },
  "Iceland":        { short:"ISL", ratings:{2016:74,2018:72,2022:68} },
  "Panama":         { short:"PAN", ratings:{2018:64} },
  "Tunisia":        { short:"TUN", ratings:{1998:68,2018:64,2022:68} },
  "Iran":           { short:"IRN", ratings:{2022:68} },
  "Senegal":        { short:"SEN", ratings:{2002:76,2022:80} },
  "USA":            { short:"USA", ratings:{1994:74,2002:76,2010:74,2022:78} },
  "South Korea":    { short:"KOR", ratings:{2002:78,2022:75} },
  "Colombia":       { short:"COL", ratings:{1994:78,2014:82,2018:80} },
  "Ukraine":        { short:"UKR", ratings:{2006:76,2021:76,2022:78} },
  "Switzerland":    { short:"SUI", ratings:{1994:74,2010:76,2018:80,2022:82} },
  "Greece":         { short:"GRE", ratings:{2004:77,2010:74} },
};

window.getOppRating = function(oppKey, season) {
  const nation = window.NATIONS[oppKey];
  if (!nation) return 72;
  const eras = Object.keys(nation.ratings).map(Number).sort((a,b)=>a-b);
  let best = eras[0];
  for (const era of eras) { if (era <= season) best = era; }
  return nation.ratings[best] || 72;
};
