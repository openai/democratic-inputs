import { LikertScaleSurveyQuestion } from '@/components'

const surveyQuestions: LikertScaleSurveyQuestion[] = [
  {
    id: 'q1A',
    label:
      'DALLE models should prioritize generating diverse outputs to represent a wide range of individuals in various professions (e.g., CEOs, doctors, nurses).',
  },
  {
    id: 'q1B',
    label:
      'User customization options, such as allowing users to specify gender, ethnicity, or other attributes, are essential in achieving more inclusive and personalized DALLE-generated depictions.',
  },
  {
    id: 'q1C',
    label:
      'Including a diverse and representative dataset during DALLE model training is crucial to avoid biases and achieve equitable representations.',
  },
  {
    id: 'q1D',
    label:
      'DALLE developers should prioritize incorporating uncertainty handling mechanisms to prevent assumptions and maintain diversity in generated outputs.',
  },
  {
    id: 'q1E',
    label:
      'Feedback loops with users play a significant role in improving the diversity and inclusivity of DALLE-generated images over time.',
  },
  {
    id: 'q1F',
    label:
      'Ethical considerations, such as avoiding harmful stereotypes and promoting equitable representations, should guide decision-making when depicting people in DALLE-generated images.',
  },
  {
    id: 'q1G',
    label:
      'Prioritizing factors like cultural diversity and gender representation is essential when deciding how DALLE models depict individuals in various professions.',
  },
  //
  {
    id: 'attention1',
    label:
      'This is an attention check question. Please type the following into the box: I am paying attention',
    type: 'text',
  },
  //
  {
    id: 'q2A',
    label: 'The use case of Generative DALLE is not relevant for me.',
  },
  {
    id: 'q2B',
    label: 'I feel ChatGPT could infringe my representation.',
  },
  {
    id: 'q2C',
    label: 'I do not fully trust in the abilities of Generative DALLE model .',
  },
  {
    id: 'q2D',
    label:
      'The use case is too important to let the Generative DALLE model decide for me. ',
  },
  {
    id: 'q2E',
    label:
      'I love organizing, customizing, deciding and doing everything myself',
  },
  {
    id: 'q2F',
    label:
      'I am concerned that it would not be exactly clear how decisions or suggestions are produced by chatGPT',
  },
  {
    id: 'q2G',
    label:
      'I believe that Generative DALLE  in general would treat me fairly when making decisions and suggestions',
  },
  {
    id: 'q2H',
    label:
      'If I have any problem with the decisions or suggestions of the Generative DALLE, I believe that the OpenDALLE would take necessary measures',
  },
  {
    id: 'q2I',
    label: 'I believe that Generative DALLE would not intentionally harm me. ',
  },
  {
    id: 'q2J',
    label:
      'I think that I am better off with the decisions and suggestions made by Generative DALLE',
  },
  {
    id: 'q2K',
    label: 'I would be willing to let Generative DALLE help me',
  },
]

export default surveyQuestions
