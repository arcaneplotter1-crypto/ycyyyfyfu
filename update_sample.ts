import fs from 'fs';

let content = fs.readFileSync('src/PdfMode.tsx', 'utf8');

const replacements = [
  ['|Why is it crucial that the heart has both atria and ventricles, and what role do the valves play in this process?|', '|F::Why does the heart have atria and ventricles?::To separate low-pressure receiving and high-pressure pumping.|'],
  ['|What exactly does an Ejection Fraction of 50% indicate about ventricular function?|', '|M::What does a 50% ejection fraction indicate?::Superb function::Borderline/Reduced function::Death::No blood is pumping::1|'],
  ["|How does the concept of 'automaticity' explain why a heart can continue to beat even outside the body, given the right conditions?|", '|F::What is automaticity?::The ability to spontaneously generate electrical impulses without external input.|'],
  ['|Why does the left ventricle have significantly more muscle mass than the right ventricle?|', '|M::Which ventricle has more muscle mass?::Right Ventricle::Left Ventricle::They are equal::Neither::1|'],
  ['|How do the electrical events shown on an ECG directly correlate with the physical squeezing and relaxing of the heart chambers?|', '|F::What do ECG waves correlate with?::Electrical depolarization and repolarization, which trigger mechanical systole and diastole.|'],
  ['|Why is it scientifically inaccurate to simply state that arteries carry oxygen-rich blood and veins carry oxygen-poor blood?|', '|F::Do all arteries carry oxygen-rich blood?::No, the pulmonary artery carries oxygen-poor blood.|'],
  ['|By what physiological mechanism does a weakened left ventricle directly cause a patient to feel breathless, even if their lungs are initially healthy?|', '|M::Why does left heart failure cause breathlessness?::Lack of oxygen in blood::Fluid backups into lungs (pulmonary edema)::Increased heart rate::Muscle cramps::1|'],
  ['|Why is referencing a foundational text like Guyton and Hall crucial when discussing the nuanced mechanisms of cardiovascular fluid dynamics?|', '|F::Who wrote the foundational text of medical physiology?::Arthur Guyton|'],
  ['|What is the largest artery?|', '|M::What is the largest artery?::Vena Cava::Aorta::Pulmonary Artery::Carotid::1|'],
  ['|How many chambers are in the human heart?|', '|F::How many chambers does the human heart have?::Four (2 atria, 2 ventricles)|'],
  ['|What does the Bundle of His connect?|', '|M::What does the Bundle of His connect?::SA Node to AV Node::AV Node to Ventricles::Atria to Ventricles directly::Right to Left Atrium::1|'],
  ['|What valve separates the left chambers?|', '|F::Which valve separates the left atrium and left ventricle?::The Mitral (Bicuspid) Valve|'],
  ['|Who invented the stethoscope?|', '|M::Who invented the stethoscope?::Rene Laennec::Louis Pasteur::Marie Curie::Florence Nightingale::0|'],
  ['|What is the formula for cardiac output?|', '|F::What is the formula for Cardiac Output (CO)?::CO = Heart Rate (HR) × Stroke Volume (SV)|'],
  ['|What imaging technique uses ultrasound for the heart?|', '|M::What uses ultrasound for the heart?::CT Scan::MRI::Echocardiogram::X-Ray::2|'],
  ['|What is the contraction phase of the heart called?|', '|F::What is the contraction phase called?::Systole|'],
  ['|What is another name for a myocardial infarction?|', '|M::Another name for a myocardial infarction is:::Stroke::Heart Attack::Aneurysm::Arrhythmia::1|'],
  ['|What does STEMI stand for?|', '|F::What does STEMI stand for?::ST-segment Elevation Myocardial Infarction|'],
  ['|What usually causes the blood flow to stop in an MI?|', '|M::What typically causes blood flow to stop in an MI?::Atherosclerotic plaque rupture with thrombus::Low blood pressure::High blood sugar::Dehydration::0|'],
  ['|How do patients with an MI typically appear?|', '|F::What are classic signs of an MI presentation?::Pale, diaphoretic, severe chest pain.|'],
  ['|What is diaphoresis?|', '|M::What is diaphoresis?::High fever::Profuse sweating::Dry skin::Blue skin::1|'],
  ['|Where might the chest pain of an MI travel to?|', '|F::Where can MI chest pain radiate?::Shoulder, arm, back, neck, or jaw.|'],
  ['|What biomarker is most specific for heart muscle damage?|', '|M::Which biomarker is most specific for cardiac damage?::AST::Troponin::Amylase::Lipase::1|'],
  ['|Name a condition that might mimic an MI.|', '|F::Name a condition mimicking an MI.::Aortic Dissection (and others like PE, Pericarditis)|'],
  ['|Where should an MI patient be admitted ideally?|', '|M::Ideally, where is an MI patient admitted?::General Medical Floor::Psychiatric Ward::ICU or Coronary Care Unit::Outpatient Clinic::2|'],
  ['|What does PCI stand for?|', '|F::What does PCI stand for?::Percutaneous Coronary Intervention|'],
  ['|What is a fatal arrhythmia commonly seen after an MI?|', '|M::What is a fatal arrhythmia commonly seen post-MI?::Sinus Tachycardia::Ventricular Fibrillation::Atrial Flutter::Premature Atrial Contractions::1|'],
  ['|Which of the listed risk factors are modifiable?|', '|F::Which risk factors are modifiable?::Smoking, hypertension, hyperlipidemia, diabetes.|'],
  ['|Does a normal initial ECG rule out an MI?|', '|M::Does a normal initial ECG rule out an MI?::Yes, absolutely.::No, repeat ECGs and biomarkers are needed.::Yes, if the patient has no pain.::Yes, if the patient is young.::1|'],
  ['|Which valve does the left ventricle pump through?|', '|F::Which valve does the left ventricle pump through?::The Aortic Valve|'],
  ['|Where does the impulse start?|', '|M::Where does the cardiac electrical impulse start?::AV Node::Purkinje Fibers::SA Node::Bundle of His::2|'],
  ['|What review module covers diseases?|', '|F::What section covers diseases?::Clinical Correlations|'],
  ['|What is the purpose of a pro tip?|', '|F::What is a pro tip for?::Highlighting key facts or strategies.|'],
  ['|How many times does the heart beat daily?|', '|M::How many times does the heart beat daily?::10,000::50,000::100,000::500,000::2|'],
  ['|How many gallons are pumped per day?|', '|F::How many gallons does the heart pump daily?::About 2,000 gallons.|'],
  ['|Which chamber is the thickest?|', '|M::Which chamber has the thickest wall?::Right Atrium::Right Ventricle::Left Atrium::Left Ventricle::3|'],
  ['|What does the matcher do?|', '|F::How do interactive matchers help?::Reinforce learning via active recall.|'],
  ['|How many bones in the human body?|', '|M::How many bones are in an adult human body?::105::206::300::350::1|'],
  ['|What does DNA stand for?|', '|F::What does DNA stand for?::Deoxyribonucleic Acid.|'],
  ['|What does the cardiovascular system transport?|', '|M::What does the cardiovascular system transport?::Nutrients, oxygen, and waste::Only oxygen::Only waste::Nerve impulses::0|']
];

for (const [search, replace] of replacements) {
    content = content.replace(search, replace);
}

fs.writeFileSync('src/PdfMode.tsx', content);
console.log("Done replacing questions");
