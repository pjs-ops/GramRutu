import type { Panchayat, PanchayatWeather, RiskLevel, WhatIfScenarioResult } from '../types';

export interface ContributingFactor {
  id: string;
  nameEn: string;
  nameMr: string;
  valueEn: string;
  valueMr: string;
  effectEn: string;
  effectMr: string;
  magnitude: 'high' | 'medium' | 'low';
}

export function getContributingFactors(
  panchayat: Panchayat,
  weather: PanchayatWeather,
  blockTemp = 31.0,
  blockRain = 12.4
): ContributingFactor[] {
  const elevDiff = panchayat.elevation - 570;
  const rainDiff = weather.rainfall - blockRain;
  const tempDiff = weather.downscalingDiff ?? weather.temperature - blockTemp;

  return [
    {
      id: 'elevation',
      nameEn: 'Topographic Elevation (Lapse Rate)',
      nameMr: 'भौगोलिक उंची व तापमान घट',
      valueEn: `${panchayat.elevation} m (${elevDiff > 0 ? '+' : ''}${elevDiff}m vs block avg)`,
      valueMr: `${panchayat.elevation} मीटर (सरासरीपेक्षा ${elevDiff > 0 ? '+' : ''}${elevDiff} मी)`,
      effectEn:
        elevDiff > 0
          ? `Higher altitude causes atmospheric cooling (~0.6°C per 100m), reducing temperature by ${Math.abs(
              tempDiff
            ).toFixed(1)}°C.`
          : `Lower valley terrain traps ground heat, keeping temperatures warmer.`,
      effectMr:
        elevDiff > 0
          ? `जास्त उंचीमुळे हवेचे तापमान कमी राहते (दर १०० मीटरला ~०.६°से घट), ज्यामुळे तापमान ${Math.abs(
              tempDiff
            ).toFixed(1)}°से ने कमी नोंदवले गेले.`
          : `खोलगट भागामुळे उष्णता साठून राहते आणि तापमान उबदार राहते.`,
      magnitude: Math.abs(elevDiff) > 50 ? 'high' : 'medium',
    },
    {
      id: 'rainfall',
      nameEn: 'Localized Precipitation Pattern',
      nameMr: 'स्थानिक पावसाचे प्रमाण',
      valueEn: `${weather.rainfall.toFixed(1)} mm (${rainDiff > 0 ? '+' : ''}${rainDiff.toFixed(1)} mm vs IMD)`,
      valueMr: `${weather.rainfall.toFixed(1)} मिमी (तालुक्यापेक्षा ${rainDiff > 0 ? '+' : ''}${rainDiff.toFixed(1)} मिमी)`,
      effectEn:
        rainDiff > 0
          ? `Western Ghats ridge creates localized cloud condensation and increased shower intensity.`
          : `Rain-shadow pocket reduces precipitation relative to the eastern boundary.`,
      effectMr:
        rainDiff > 0
          ? `घाटाच्या उतारावरील ढगांच्या दाटीमुळे या भागात स्थानिक पावसाचे प्रमाण अधिक आहे.`
          : `पर्जन्यछायेच्या क्षेत्रामुळे येथे तालुक्याच्या सरासरीपेक्षा कमी पाऊस पडतो.`,
      magnitude: Math.abs(rainDiff) > 15 ? 'high' : 'medium',
    },
    {
      id: 'landcover',
      nameEn: 'Land Cover & Microclimate',
      nameMr: 'जमिनीचे आच्छादन व सूक्ष्म हवामान',
      valueEn: `${panchayat.landCover}`,
      valueMr: translateLandCover(panchayat.landCover),
      effectEn:
        panchayat.landCover.toLowerCase().includes('irrigated') ||
        panchayat.landCover.toLowerCase().includes('forest')
          ? `Dense vegetative transpiration enhances local air moisture and absorbs solar radiation.`
          : `Open cropland and soil surface increase midday ambient heat reflection.`,
      effectMr:
        panchayat.landCover.toLowerCase().includes('irrigated') ||
        panchayat.landCover.toLowerCase().includes('forest')
          ? `बागायती पिके व झाडांच्या बाष्पोत्सर्जनामुळे जमिनीत ओलावा टिकून गारवा निर्माण होतो.`
          : `उघड्या शेतजमिनीमुळे दुपारच्या वेळी जमिनीवरून उष्णता परावर्तित होते.`,
      magnitude: 'medium',
    },
  ];
}

function translateLandCover(lc: string): string {
  if (lc.includes('Irrigated')) return 'बागायती शेतजमीन';
  if (lc.includes('Rainfed')) return 'जिरायती शेतजमीन';
  if (lc.includes('Forest')) return 'वनक्षेत्र व झुडूप आच्छादन';
  if (lc.includes('Mixed')) return 'मिश्र पीक पद्धती क्षेत्र';
  return lc;
}

export function computeScenarioRisk(
  currentRainfall: number,
  scenarioRainfall: number,
  currentRisk: RiskLevel,
  cropName = 'Tomato'
): WhatIfScenarioResult {
  let scenarioRisk: RiskLevel = 'Low';

  // Realistic agronomic thresholding for prototype
  if (scenarioRainfall >= 75) {
    scenarioRisk = 'Severe';
  } else if (scenarioRainfall >= 50) {
    scenarioRisk = 'High';
  } else if (scenarioRainfall >= 25) {
    scenarioRisk = 'Moderate';
  } else {
    scenarioRisk = 'Low';
  }

  // Evaluate risk shift direction
  const riskLevels: RiskLevel[] = ['Low', 'Moderate', 'High', 'Severe'];
  const curIdx = riskLevels.indexOf(currentRisk);
  const scnIdx = riskLevels.indexOf(scenarioRisk);

  let riskDiff: 'increased' | 'decreased' | 'unchanged' = 'unchanged';
  if (scnIdx > curIdx) riskDiff = 'increased';
  else if (scnIdx < curIdx) riskDiff = 'decreased';

  const diffRain = scenarioRainfall - currentRainfall;
  const absDiff = Math.abs(diffRain);

  // Explanations & farmer advice
  let explanationEn = '';
  let explanationMr = '';
  let actionMessageEn = '';
  let actionMessageMr = '';

  if (riskDiff === 'increased') {
    explanationEn = `Rainfall increases from ${currentRainfall.toFixed(0)} mm to ${scenarioRainfall.toFixed(
      0
    )} mm (+${absDiff.toFixed(0)} mm). Elevated water table causes root-zone asphyxiation and increases vulnerability to bacterial wilt in ${cropName}. Risk elevates from ${currentRisk} to ${scenarioRisk}.`;
    explanationMr = `पाऊस ${currentRainfall.toFixed(0)} मिमी वरून ${scenarioRainfall.toFixed(
      0
    )} मिमी पर्यंत (+${absDiff.toFixed(0)} मिमी) वाढल्यास शेतात पाणी साचून मुळांना हवा मिळणार नाही. ${cropName} पिकात बुरशीजन्य सड व करप्याचा प्रादुर्भाव वाढून धोका '${currentRisk}' वरून '${scenarioRisk}' होतो.`;

    actionMessageEn =
      'Action: Clear drainage furrows immediately to allow surplus runoff. Suspend scheduled fertigation and fungicide sprays until field soils drain.';
    actionMessageMr =
      'तातडीचा सल्ला: शेतातील अतिरिक्त पाण्याचा चर काढून त्वरित निचरा करा. पाऊस थांबेपर्यंत खते देणे व औषध फवारणी पूर्णपणे थांबवा.';
  } else if (riskDiff === 'decreased') {
    explanationEn = `Rainfall decreases from ${currentRainfall.toFixed(0)} mm to ${scenarioRainfall.toFixed(
      0
    )} mm (-${absDiff.toFixed(0)} mm). Excess moisture subsides, significantly reducing waterlogging pressure. Risk moderates from ${currentRisk} to ${scenarioRisk}.`;
    explanationMr = `पाऊस ${currentRainfall.toFixed(0)} मिमी वरून ${scenarioRainfall.toFixed(
      0
    )} मिमी पर्यंत (-${absDiff.toFixed(0)} मिमी) कमी झाल्यास पाणी साचण्याचा ताण कमी होतो. त्यामुळे पिकाचा धोका '${currentRisk}' वरून '${scenarioRisk}' पर्यंत कमी होतो.`;

    actionMessageEn =
      'Action: Normal field operations can resume safely. Monitor soil moisture in high-drainage patches.';
    actionMessageMr =
      'सल्ला: शेतीची नियमित कामे पूर्ववत सुरू करू शकता. हलक्या जमिनीत ओलावा टिकवून ठेवण्यावर लक्ष ठेवावे.';
  } else {
    explanationEn = `At ${scenarioRainfall.toFixed(
      0
    )} mm rainfall, overall soil moisture balance remains within current stress boundaries. Risk level remains steady at ${scenarioRisk}.`;
    explanationMr = `${scenarioRainfall.toFixed(
      0
    )} मिमी पावसात जमिनीतील ओलावा सध्याच्या मर्यादेतच राहतो. पिकाचा धोका '${scenarioRisk}' पातळीवर कायम राहील.`;

    actionMessageEn = 'Action: Continue routine crop monitoring and maintain standard furrow spacing.';
    actionMessageMr = 'सल्ला: पिकाचे नियमित निरीक्षण चालू ठेवा आणि पाण्याचा निचरा योग्य राहील याची खात्री करा.';
  }

  return {
    currentRainfall,
    scenarioRainfall,
    currentRisk,
    scenarioRisk,
    riskDiff,
    explanationEn,
    explanationMr,
    actionMessageEn,
    actionMessageMr,
  };
}
