import { motion } from "framer-motion"
import { Eye, Gavel, Globe, Users } from "lucide-react"

import { Button } from "@/components/ui/button"
import ScrollProgressCircle from "@/components/ui/scroll-progress-circle"
import { Separator } from "@/components/ui/separator"
import { cn } from "@/lib/utils"
import Image from "next/image"
import Link from "next/link"

interface Props {
  className?: string
}

export const HowItWorksCards = ({ className }: Props) => (
  <div className={cn("mt-4 mt-8 space-y-4", className)}>
    <div className="flex items-start rounded border bg-muted p-4">
      <div className="mr-4">
        <Users className="h-6 w-6" />
      </div>
      <div>
        <h2 className="text-lg font-semibold">Contributors propose and rate guidelines</h2>
        <p className="pt-2">
          Our community consists of people from around the world, just like you, who propose and rate guidelines.
          Join&nbsp;
          <Link rel="noopener noreferrer" href="https://app.energize.ai/" target="_blank">
            <u>here</u>
          </Link>
          .
        </p>
      </div>
    </div>
    <div className="flex items-start rounded border bg-muted p-4">
      <div className="mr-4">
        <Globe className="h-6 w-6" />
      </div>
      <div>
        <h2 className="text-lg font-semibold">
          Only guidelines supported by people from diverse perspectives are used
        </h2>
        <p className="pt-2">
          Decisions are not made by majority rule. The algorithm requires people from a diverse set of perspectives to
          support a guideline before it is constitution-ready. This ensures that approved guidelines are helpful to a
          wide range of people.
        </p>
      </div>
    </div>
    <div className="flex items-start rounded border bg-muted p-4">
      <div className="mr-4">
        <Gavel className="h-6 w-6" />
      </div>
      <div>
        <h2 className="text-lg font-semibold">Resulting guidelines are principled and practical</h2>
        <p className="pt-2">
          This is not a research experiment where a select group sits in a room to talk about human morality in an
          artificial, sanitized environment. Instead, we record the real-world issues that users find and what those
          users think should be done to resolve them. We prioritize human and machine-interpretable guidelines that
          successfully shape AI behavior.
        </p>
      </div>
    </div>
    <div className="flex items-start rounded border bg-muted p-4">
      <div className="mr-4">
        <Eye className="h-6 w-6" />
      </div>
      <div>
        <h2 className="text-lg font-semibold">Open and transparent</h2>
        <p className="pt-2">
          The algorithm and platform frontend are fully open-source and accessible. We invite&nbsp;
          <Link rel="noopener noreferrer" href="https://app.energize.ai/feedback" target="_blank">
            <u>input and feedback</u>
          </Link>
          &nbsp;from the community.
        </p>
      </div>
    </div>
  </div>
)

export default function Algo() {
  var Latex = require("react-latex")

  return (
    <div className="mx-auto max-w-3xl py-10 lg:py-24">
      <ScrollProgressCircle />
      <div className="flex flex-col items-start justify-between gap-16 lg:flex-row">
        <motion.div
          whileInView={{ scale: 1, opacity: 1, translateX: 0 }}
          viewport={{ once: true }}
          initial={{ scale: 1, opacity: 0, translateX: -100 }}
          transition={{ duration: 0.5 }}
        >
          <h1 className="scroll-m-20 text-2xl font-bold tracking-tight lg:text-5xl">the algorithm</h1>
          <p className="leading-7 [&:not(:first-child)]:mt-8">
            We need a new approach to democratically align AI. Aligned is a platform for global steering, evaluation,
            and alignment of Large Language Models. Our algorithm reflects this commitment to open and transparent
            development.
          </p>
        </motion.div>
        <motion.div
          className="rounded-md bg-gradient-to-r from-rose-100 to-indigo-100 p-2 dark:from-rose-900/50 dark:to-indigo-900/50"
          whileInView={{ scale: 1, rotate: 0, opacity: 1, translateX: 0 }}
          viewport={{ once: true }}
          initial={{ scale: 0.8, rotate: 40, opacity: 0, translateX: 40 }}
          transition={{ duration: 0.5 }}
        >
          <Image
            src={"/images/blogs/welcome/globe1.png"}
            alt={"globe1.png"}
            className="object-fit rounded-md"
            width={1500}
            height={1500}
          />
        </motion.div>
      </div>
      <Separator className="mt-8" />
      <p className="leading-7 [&:not(:first-child)]:mt-10">Aligned is a platform for democratic AI alignment.</p>
      <p className="leading-7 [&:not(:first-child)]:mt-3">
        The platform is built to address the complexities of democracy. In particular, we design Aligned and its
        algorithm around three core principles: <b>simplicity</b>, <b>scalability</b>, and <b>practicality</b>.
      </p>

      <HowItWorksCards />

      <Separator className="my-8 mt-10" />

      <h3 className="scroll-m-20 text-2xl font-semibold tracking-tight">Algorithm Details</h3>
      <p className="leading-7 [&:not(:first-child)]:mt-4">
        The algorithm is based on Twitter{`'`}s Community Notes rating algorithm. You can read their open-sourced
        documentation&nbsp;
        <Link
          rel="noopener noreferrer"
          href="https://communitynotes.twitter.com/guide/en/under-the-hood/ranking-notes"
          target="_blank"
        >
          <u>here</u>
        </Link>
        . Special thanks to Jay Baxter, head of Community Notes ML, for his inputs and discussions in Aligned{`'`}s
        development.
        <Image
          src={"/images/blogs/welcome/rate2.png"}
          alt={"rate2.png"}
          className="object-fit mx-auto mt-8 rounded-md"
          width={500}
          height={500}
        />
        <h5 className="mt-8 scroll-m-20 text-lg font-semibold tracking-tight">Overview</h5>
        <p className="leading-7 [&:not(:first-child)]:mt-4">
          The Aligned algorithm takes 2 main inputs: guidelines, and ratings of those guidelines. Although both options
          are openly available for any member of Aligned to use, most users spend their time rating guidelines rather
          than proposing their own.
        </p>
        <p className="leading-7 [&:not(:first-child)]:mt-4">
          These ratings are of the form {`"`}Helpful{`"`} or {`"`}Not helpful.{`"`} After choosing an option, and based
          on much feedback from our community, we{`'`}ve added tags to enable users to describe why they are rating a
          certain giudeline in that manner. We believe this simple input format is most realistic for future
          scalability.
        </p>
        <p className="leading-7 [&:not(:first-child)]:mt-4">
          Based on a given person{`'`}s past ratings, we can represent their perspective as an embedding. Then, when a
          set of members rate a new guideline, we require the guideline to have {`"`}Helpful{`"`} ratings from a broad
          spectrum of perspectives. Such a bridging algorithm enables us to identify areas and guidelines with
          consensus.
        </p>
        <h5 className="mt-8 scroll-m-20 text-lg font-semibold tracking-tight">Technical Implementation</h5>
        <p className="leading-7 [&:not(:first-child)]:mt-4">
          The model learns five things: embeddings for both guidelines and users and intercept terms for both guidelines
          and users, as well as a global intercept term. The embeddings can be thought as a representation of belief. On
          Twitter, this is primarilly a proxy for political belief. High embedding values are associated with
          conservatism, and low values with liberalism. None of these relationships from the embedding space to real
          beliefs are hard-coded - they are all naturally learned from which subset of community notes users tend to
          like. Both users and guidelines are positioned in this embedding space.
        </p>
        <p className="leading-7 [&:not(:first-child)]:mt-4">
          The global and user intercepts can be thought of as the optimism of users: higher intercepts mean that that
          user is friendlier to all responses even when accounting for their relationship in the embedding space, and
          the global intercept is a general adjustment for how likely people are to like responses. The guideline
          intercepts are what we care about. Guidelines with a high intercept were endorsed from people far more than
          what would be expected from the embeddings of those users and the guideline and the global and user
          intercepts.
        </p>
        <p className="leading-7 [&:not(:first-child)]:mt-4">
          Formally, we can express our prediction for whether a particular user rated a guideline postively as
          <Latex displayMode={true}>{"$$\\hat Y_{ug} = \\mu + i_u + i_g +f_u \\cdot f_g$$"}</Latex>
          <Latex>
            {`where $\\hat{Y_{ug}}$ is the prediction, $i_u$ is the user's intercept, $i_g$ is
            the guideline intercept, and $f_u$ and $f_g$ are the embeddings. We then minimize over all observed ratings $Y_{ug}$ `}
          </Latex>
        </p>
        <p className="leading-7 [&:not(:first-child)]:mt-4">
          <Latex displayMode={true}>
            {`$$\\frac{1}{n}\\sum_{Y_{ug}} \\left(Y_{ug} - \\hat Y_{ug}\\right)^2 + \\Lambda(\\mu, i_u, i_j, f_u, f_g)$$`}
          </Latex>

          <Latex>
            {`where $\\Lambda(\\mu, i_u, i_j, f_u, f_g)$ is a regularization term on the intercepts and embeddings
            and $n$ is the total number of observed ratings. We minimize this squared error model using gradient 
            descent until the loss function converges.`}
          </Latex>
        </p>
        <p className="leading-7 [&:not(:first-child)]:mt-4">
          As data is added, we randomly initialize the intercepts and embeddings for that data and retrain the model
          with both the old and new parameters to maintain inter-run stability.
        </p>
      </p>

      <Link href="https://app.energize.ai/">
        <Button className="mt-6">Join Aligned</Button>
      </Link>
      <small className="block leading-7 [&:not(:first-child)]:mt-6">
        Have any more questions? Feel free to message us with our{" "}
        <Link href="/feedback" className="cursor-pointer font-semibold text-primary hover:underline">
          contact form
        </Link>
        .
      </small>
    </div>
  )
}
