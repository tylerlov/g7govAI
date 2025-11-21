
import { Playbook } from './types';

export const INITIAL_MODEL_CLAUSES: Record<string, string> = {
  'License to Model Inputs and Model Outputs': "Government Entity grants to Supplier a limited, revocable, non-exclusive license to access and use solely to perform the AI-related services.",
  'Retention of Model Inputs and Model Outputs': "Unless required by applicable law, Supplier will not retain any Government Entity Models, Model Inputs and Model Outputs for longer than 30 days, or such other time period prescribed by Government Entity. Except to comply with applicable law, Supplier will delete all such Model Inputs and Model Outputs after such period of time.",
  'Model Improvement': "Supplier will not use Government Entity Property to pre-train, train, or otherwise improve or enhance any Models without the prior written consent of Government Entity.",
  'Ownership of Model Inputs and Model Outputs': "Government Entity Property includes Government Entity Models, Model Inputs and Models Outputs, which Government Entity exclusively owns all rights, title, and interest to (“Government Entity Property”).",
  'Output Indemnification': "Without limiting anything to the contrary herein, Supplier will indemnify, defend and hold harmless Government Entity from and against any and all claims, losses, costs, damages (including enhanced, punitive, and willful), expenses, liabilities, settlement payments, interest, awards, judgments, fines, fees, penalties and legal defense fees and costs (including the legal fees and costs incurred to enforce the terms of this indemnity against Supplier, if necessary) suffered or incurred by any of them arising from a third party alleging that Model Outputs infringes, violates or misappropriates any intellectual property rights of a third party, provided Government Entity has not intentionally used the Supplier’s products and services in connection with this Agreement in a manner that is intended to generate infringing Model Outputs.",
  'Transition Out and Model Portability': "Upon request from Government Entity and at no additional cost and expense, Supplier will provide Government Entity with reasonable assistance and cooperation sufficient for Government Entity (or a service provider on Government Entity’s behalf) to make use of, modify, further train, fine-tune and deploy such Government Entity Models. Such assistance will include: (i) the provision of a transition document containing all Minimum Information for Model Deployment of such Models; (ii) reasonable technical assistance to facilitate; and (iii) any other assistance required by Government Entity to use, change, further develop and deploy such Government Entity Models either itself or through the engagement of another service provider.",
  'License to Reproduce and Modify': "Supplier hereby grants to Government Entity a worldwide, perpetual, royalty-free, non-exclusive, sublicensable and transferable right and license to use, reproduce, modify, adapt, translate or creative derivative works from Supplier’s intellectual property rights required by Government Entity (or a service provider on Government Entity’s behalf) to make use of, modify, further train, fine-tune and deploy such Government Entity Models.",
  'Additional Provisions': "The parties acknowledges that the requirements related to the use of AI are evolving and that during the performance of the Services, Government Entity may have additional requirements with respect to Supplier’s use of AI. If requested by Government Entity, the parties will use good faith efforts to negotiate additional terms and conditions to address any additional requirements and conditions of Government Entity pursuant to an amendment to this Agreement.",
};

export const INITIAL_PLAYBOOKS: Playbook[] = [
  {
    id: 1,
    name: 'Sample AI Guidelines for Government AI Contracts',
    description: 'Addendum and sample clauses appropriate for use with suppliers of SaaS software with AI capablities or professional services for model development or customization.',
    sharedWith: 'All'
  },
  {
    id: 2,
    name: 'ISED: Voluntary Code of Conduct on the Responsible Development and Management of Advanced Generative AI Systems',
    description: 'Use for use with advanced AI systems, and high-impact systems in particular, capable of generating content',
    sharedWith: 'Federal'
  },
  {
    id: 3,
    name: 'Government of Canada: Directive on Automated Decision Making',
    description: 'Applies to all automated decision systems developed or procured after April 1, 2020',
    sharedWith: 'All'
  },
  {
    id: 4,
    name: 'Justice: General Conditions (Professional Services)',
    description: 'Generally applicable to all contracts for professional services',
    sharedWith: 'Justice Ottawa'
  },
   {
    id: 5,
    name: 'Bank of Canada - AI Procurement Playbook (Custom Development)',
    description: 'Use for contracts relating to custom-developed AI software',
    sharedWith: 'BoC Federal'
  }
];
