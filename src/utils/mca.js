import criteriaData from '../data/criteria.json';

/**
 * Run the MCA given answers object: { criterionId_questionId: score (1-4) }
 * Returns { overallScore, criteriaScores, weakest, level }
 */
export function runMCA(answers) {
  const { criteria, mcaWeights, levels } = criteriaData;
  const criteriaScores = {};

  for (const criterion of criteria) {
    const questionScores = criterion.questions.map((q) => {
      const key = `${criterion.id}_${q.id}`;
      const score = answers[key] ?? null;
      return score;
    });

    const answered = questionScores.filter((s) => s !== null);
    if (answered.length === 0) {
      criteriaScores[criterion.id] = null;
      continue;
    }

    const avg = answered.reduce((a, b) => a + b, 0) / answered.length;
    // Normalise to 0-100
    const normalised = ((avg - 1) / 2) * 100;
    criteriaScores[criterion.id] = Math.round(normalised);
  }

  // Weighted overall score
  let totalWeight = 0;
  let weightedSum = 0;
  for (const [id, score] of Object.entries(criteriaScores)) {
    if (score !== null) {
      const w = mcaWeights[id] ?? 0;
      weightedSum += score * w;
      totalWeight += w;
    }
  }

  const overallScore = totalWeight > 0 ? Math.round(weightedSum / totalWeight) : 0;

  // Determine level
  let level = levels.in_transition;
  if (overallScore >= levels.regenerative.min) level = levels.regenerative;
  else if (overallScore >= levels.approaching.min) level = levels.approaching;

  // Weakest criteria (lowest scores, sorted)
  const ranked = Object.entries(criteriaScores)
    .filter(([, s]) => s !== null)
    .sort(([, a], [, b]) => a - b);

  const weakest = ranked.slice(0, 3).map(([id, score]) => {
    const criterion = criteria.find((c) => c.id === id);
    return { id, score, title: criterion.title };
  });

  return { overallScore, criteriaScores, weakest, level };
}

/**
 * Get next-step recommendations for a criterion based on its score
 */
export function getRecommendations(criterionId, score) {
  const recs = {
    soil_management: [
      { maxScore: 30, text: 'Stop ploughing and start with minimum tillage. Add a simple organic mulch layer between trees.' },
      { maxScore: 60, text: 'Transition to a permanent living cover crop between rows. Try chipping pruning residues and leaving them as mulch.' },
      { maxScore: 80, text: 'Introduce a diverse cover crop mix with legumes. Observe and record soil structure changes each season.' },
      { maxScore: 100, text: 'Maintain your no-till system and monitor earthworm counts and soil aggregation each year.' },
    ],
    water: [
      { maxScore: 30, text: 'Install a basic drip irrigation system. Contact the irrigation community (comunidad de regantes) for efficiency guidance.' },
      { maxScore: 60, text: 'Add soil moisture sensors to your drip system. Explore swale or terrace options to reduce runoff.' },
      { maxScore: 80, text: 'Build a small on-farm rainwater storage pond or infiltration trench to capture winter rainfall.' },
      { maxScore: 100, text: 'Fine-tune your water monitoring and document annual use. Share your approach with other Valencia farmers.' },
    ],
    biodiversity: [
      { maxScore: 30, text: 'Plant a simple flower strip on one orchard margin. Stop mowing margins to allow natural vegetation to establish.' },
      { maxScore: 60, text: 'Install insect hotels and bat boxes. Connect existing margin vegetation into a corridor.' },
      { maxScore: 80, text: 'Create a small pond or wet area to support amphibians and beneficial insects. Plant native hedges on at least two sides.' },
      { maxScore: 100, text: 'Map the biodiversity corridors on your farm annually and share findings with local conservation groups.' },
    ],
    plant_health_inputs: [
      { maxScore: 30, text: 'Start by replacing one synthetic pesticide application with a biological alternative (e.g. pheromone trap, neem oil). Stop all routine preventive spraying.' },
      { maxScore: 60, text: 'Install pheromone traps for key citrus pests. Introduce beneficial insect habitats to reduce dependency on pesticides.' },
      { maxScore: 80, text: 'Eliminate remaining synthetic inputs. Use plant extracts and biological preparations as your primary protection strategy.' },
      { maxScore: 100, text: 'Document your biological pest management approach and share it as a model for neighbouring farmers.' },
    ],
    soil_nutrition: [
      { maxScore: 30, text: 'Start composting your pruning residues. Apply compost or organic matter at least once per year instead of synthetic fertilisers.' },
      { maxScore: 60, text: 'Introduce a legume cover crop (vetch, clover) to begin building natural nitrogen. Try a biofertiliser application.' },
      { maxScore: 80, text: 'Establish a full cover crop mix with legumes, grasses and native plants. Add mycorrhizal inoculant at replanting.' },
      { maxScore: 100, text: 'Maintain your soil biology programme and conduct annual soil analysis to track organic matter and microbial activity.' },
    ],
    vegetation_management: [
      { maxScore: 30, text: 'Stop removing all vegetation. Allow spontaneous vegetation to grow and practice single annual mowing only.' },
      { maxScore: 60, text: 'Chip all pruning residues and keep them as mulch. Explore whether neighbouring farmers have livestock you could integrate seasonally.' },
      { maxScore: 80, text: 'Establish a planned grazing arrangement with a local livestock farmer for seasonal vegetation management.' },
      { maxScore: 100, text: 'Refine your grazing rotation timing based on vegetation recovery and soil impact observations.' },
    ],
    crop_diversification: [
      { maxScore: 30, text: 'Introduce one or two traditional Valencia citrus varieties (e.g. Clemenules, Navel) alongside your main variety.' },
      { maxScore: 60, text: 'Plant a few other fruit trees in orchard margins (almond, fig, carob) to begin an agroforestry structure.' },
      { maxScore: 80, text: 'Add companion plants and trap crops (marigolds, radishes) in the orchard to start ecological pest management.' },
      { maxScore: 100, text: 'Document your diversification system and explore markets for diverse or heritage citrus varieties.' },
    ],
    plastics_waste: [
      { maxScore: 30, text: 'Collect all plastics and take them to a certified waste point. Stop burning or leaving plastics in the field.' },
      { maxScore: 60, text: 'Replace single-use drip tape with long-life alternatives. Switch to reusable crates for harvest.' },
      { maxScore: 80, text: 'Partner with a certified plastics recycling company for traceability. Explore geotextile or bioplastic alternatives.' },
      { maxScore: 100, text: 'Maintain your traceability records and share your plastic reduction strategy with your cooperative.' },
    ],
    contextuality: [
      { maxScore: 30, text: 'Write down three specific things you want to change on your farm this year. This is your first plan.' },
      { maxScore: 60, text: 'Start a simple farm diary: note weather events, pest observations and any changes you make each month.' },
      { maxScore: 80, text: 'Attend a regenerative agriculture course or farm visit. Set up annual soil sampling to track your progress.' },
      { maxScore: 100, text: 'Formalise your monitoring system with photo points, soil tests and annual review of your management plan.' },
    ],
    social_foundations: [
      { maxScore: 30, text: 'Attend one local farmers event or cooperative meeting this season. Introduce yourself to a neighbouring farmer using regenerative practices.' },
      { maxScore: 60, text: 'Join a local or national regenerative agriculture network (e.g. Asociación de Agricultura Regenerativa Ibérica).' },
      { maxScore: 80, text: 'Open your farm for a visit or share your experience on social media. Connect with researchers at a local university.' },
      { maxScore: 100, text: 'Actively mentor other transitioning farmers in your area or contribute to citizen science biodiversity monitoring.' },
    ],
    soil_health: [
      { maxScore: 30, text: 'Your soil shows signs of compaction and low biological activity. Prioritise stopping tillage and adding organic mulch as a first step.' },
      { maxScore: 60, text: 'Your soil is improving. Add a diverse cover crop mix with legumes and apply compost to accelerate organic matter build-up.' },
      { maxScore: 80, text: 'Good soil structure and biology. Conduct an earthworm count and soil colour check each spring to track continued improvement.' },
      { maxScore: 100, text: 'Excellent soil health. Document and share your practices — your soil is a model for what regenerative agriculture achieves.' },
    ],
  };

  const list = recs[criterionId] ?? [];
  const match = list.find((r) => score <= r.maxScore);
  return match ? match.text : 'Keep monitoring and sharing your progress with your network.';
}

export { criteriaData };
