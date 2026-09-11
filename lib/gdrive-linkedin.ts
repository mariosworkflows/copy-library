import type { CopyCampaign } from "./copy-types";

// LinkedIn copy sourced from Google Drive client folders.
// These campaigns exist in GDrive docs but not in Instantly.
// Client names use the base name (e.g. "HeyReach") — the API merges
// them and page.tsx normalises by base name for grouping.

export const GDRIVE_LINKEDIN_CAMPAIGNS: CopyCampaign[] = [

  // ── HEYREACH ──────────────────────────────────────────────────────────────

  {
    id: "gdrive-heyreach-li-marketing",
    name: "LinkedIn - Marketing Track",
    client: "HeyReach",
    channel: "LinkedIn",
    positiveReplies: 0,
    positiveReplyRate: null,
    replyRate: null,
    status: null,
    decisionMakers: "",
    angle: "",
    masterRecordId: null,
    category: "signal",
    subcategory: "linkedin_engagement",
    steps: [
      {
        id: "gdrive-heyreach-li-marketing-1",
        label: "DM 1",
        channel: "linkedin",
        body: `Hey {{firstName}}, happy to connect.

Saw you {{relevancyPersonalisation}}.

Has your team considered using LinkedIn as an outreach channel to drive more event attendees?

There's a very simple automated workflow you can set up to invite the right people at scale (without manual work) - and avoid typical email spam problems.

Want to check out a quick Loom on what that looks like?`,
      },
      {
        id: "gdrive-heyreach-li-marketing-2",
        label: "Follow-up 1",
        channel: "linkedin",
        body: `Here's a Loom that explains what I mean,

Find your ICP, add your copy, and let LinkedIn invites and messages run automatically.

No need to share credentials. One person can launch on behalf of others.

We can run a 2-week free trial to see the uplift you'd get?`,
      },
      {
        id: "gdrive-heyreach-li-marketing-3",
        label: "Follow-up 2",
        channel: "linkedin",
        body: `Here's a Loom that explains what I mean, I think it's quite easy to understand.

Do you think it could be interesting for your team to implement?`,
      },
    ],
  },

  {
    id: "gdrive-heyreach-li-sales-a",
    name: "LinkedIn - Sales Track (Variant A)",
    client: "HeyReach",
    channel: "LinkedIn",
    positiveReplies: 0,
    positiveReplyRate: null,
    replyRate: null,
    status: null,
    decisionMakers: "",
    angle: "",
    masterRecordId: null,
    category: "signal",
    subcategory: "linkedin_engagement",
    steps: [
      {
        id: "gdrive-heyreach-li-sales-a-1",
        label: "DM 1",
        channel: "linkedin",
        body: `Hey {{firstName}}, happy to connect.

Saw you {{relevancyPersonalisation}}.

Did you notice that I viewed your profile yesterday, 3hrs after asked for a LI connect, and as soon as you accepted this message was sent?

I did this automatically in HeyReach… do you think it could also be useful for your sales team?

We're basically helping companies sell through LinkedIn DMs at scale.`,
      },
      {
        id: "gdrive-heyreach-li-sales-a-2",
        label: "Follow-up 1",
        channel: "linkedin",
        body: `Here's a Loom that explains what I mean :)

Let me know if your team gave up on scaling growth through LinkedIn, or you're still open to giving it a shot with more modern tech.

PS some clients see 58% reply rates from all the different automated touchpoints, and there's no risk of getting banned with the right configurations.`,
      },
      {
        id: "gdrive-heyreach-li-sales-a-3",
        label: "Follow-up 2",
        channel: "linkedin",
        body: `Here's a Loom that explains what I mean, I think it's quite easy to understand.

Do you think it could be interesting for your team to implement?

PS some clients see 58% reply rates from all the different automated touchpoints.`,
      },
    ],
  },

  {
    id: "gdrive-heyreach-li-sales-b",
    name: "LinkedIn - Sales Track (Variant B)",
    client: "HeyReach",
    channel: "LinkedIn",
    positiveReplies: 0,
    positiveReplyRate: null,
    replyRate: null,
    status: null,
    decisionMakers: "",
    angle: "",
    masterRecordId: null,
    category: "signal",
    subcategory: "linkedin_engagement",
    steps: [
      {
        id: "gdrive-heyreach-li-sales-b-1",
        label: "DM 1",
        channel: "linkedin",
        body: `Hey {{firstName}},

Saw you {{relevancyPersonalisation}}.

Confession time.. noticed how I viewed your profile yesterday, 3hrs after asked for a LI connect, and as soon as you accepted this message was sent?

Yeah… that wasn't me being ultra-efficient, that was HeyReach doing its thing - would this be handy for your sales team?

P.S. We're big on eating our own dog food around here… so yes, this message is a live demo`,
      },
      {
        id: "gdrive-heyreach-li-sales-b-2",
        label: "Follow-up 1",
        channel: "linkedin",
        body: `Here's a Loom that explains what I mean :)

Let me know if your team gave up on scaling growth through LinkedIn, or you're still open to giving it a shot with more modern tech.

PS some clients see 58% reply rates from all the different automated touchpoints, and there's no risk of getting banned with the right configurations.`,
      },
      {
        id: "gdrive-heyreach-li-sales-b-3",
        label: "Follow-up 2",
        channel: "linkedin",
        body: `Here's a Loom that explains what I mean, I think it's quite easy to understand.

Do you think it could be interesting for your team to implement?

PS some clients see 58% reply rates from all the different automated touchpoints.`,
      },
    ],
  },

  {
    id: "gdrive-heyreach-li-gtm",
    name: "LinkedIn - GTM Track",
    client: "HeyReach",
    channel: "LinkedIn",
    positiveReplies: 0,
    positiveReplyRate: null,
    replyRate: null,
    status: null,
    decisionMakers: "",
    angle: "",
    masterRecordId: null,
    category: "signal",
    subcategory: "linkedin_engagement",
    steps: [
      {
        id: "gdrive-heyreach-li-gtm-1",
        label: "DM 1",
        channel: "linkedin",
        body: `Hey {{firstName}}, happy to connect.

Saw you haven't used us yet, so wanted to show you what HeyReach can do for GTM engineers like you.

Lots of GTM teams leave LinkedIn to sales reps, but we've built a tool to plug into your Clay table for making outreach personalised and automated.

Would it be useful to send a Loom explaining how it works in more detail?`,
      },
      {
        id: "gdrive-heyreach-li-gtm-2",
        label: "Follow-up 1",
        channel: "linkedin",
        body: `Here's quick walkthrough on how to plug this into your Clay tables.

You already have the data - this just turns LinkedIn into the execution layer;

https://www.youtube.com/watch?v=i8NWsuEEV94

What do you think? :)`,
      },
      {
        id: "gdrive-heyreach-li-gtm-3",
        label: "Follow-up 2",
        channel: "linkedin",
        body: `Here's quick walkthrough on how to plug this into your Clay tables.

You already have the data - this just turns LinkedIn into the execution layer.

Do you think it could be interesting for your team to implement?

PS some clients see 58% reply rates from all the different automated touchpoints, and there's no risk of getting banned with the right configurations.`,
      },
    ],
  },

  {
    id: "gdrive-heyreach-li-agency",
    name: "LinkedIn - Agency Track",
    client: "HeyReach",
    channel: "LinkedIn",
    positiveReplies: 0,
    positiveReplyRate: null,
    replyRate: null,
    status: null,
    decisionMakers: "",
    angle: "",
    masterRecordId: null,
    category: "signal",
    subcategory: "linkedin_engagement",
    steps: [
      {
        id: "gdrive-heyreach-li-agency-1",
        label: "DM 1",
        channel: "linkedin",
        body: `Hey {{firstName}}

Saw you {{personalization}}.

Quick one - any LinkedIn delivery/ops headaches lately?

My guess is HeyReach is (or was) already on your radar, curious if you've ever given it a spin?`,
      },
      {
        id: "gdrive-heyreach-li-agency-2",
        label: "Follow-up 1",
        channel: "linkedin",
        body: `We have a library of agency workflows getting pretty crazy results.

Workflows hit a 58% reply rate on one of their Linkedin DM campaigns.

Happy to send you our agency workflows?`,
      },
      {
        id: "gdrive-heyreach-li-agency-3",
        label: "Follow-up 2",
        channel: "linkedin",
        body: `Btw I have a library of workflows you can look at to understand how this works.

One of our clients Outwrite hit a 58% reply rate on one of their workflows, would it be useful to send a breakdown of the steps?`,
      },
    ],
  },

  // ── INVOICE BUTLER ────────────────────────────────────────────────────────

  {
    id: "gdrive-ib-li-engagers-a1",
    name: "LinkedIn Engagers - Angle 1",
    client: "Invoice Butler",
    channel: "LinkedIn",
    positiveReplies: 0,
    positiveReplyRate: null,
    replyRate: null,
    status: null,
    decisionMakers: "",
    angle: "",
    masterRecordId: null,
    category: "signal",
    subcategory: "linkedin_engagement",
    steps: [
      {
        id: "gdrive-ib-li-engagers-a1-conn",
        label: "Connection Note A",
        channel: "linkedin",
        body: `Hey {{firstName|there}}, {{engagementLine}} so thought I would connect here. I'm on a mission to make getting paid simpler for B2B businesses through AI. Open to connecting?`,
      },
      {
        id: "gdrive-ib-li-engagers-a1-conn-b",
        label: "Connection Note B",
        channel: "linkedin",
        body: `Hey {{firstName|there}}, {{engagementLine}} so thought I would connect. I run Invoice Butler, where we help businesses save the time and focus wasted on chasing aging invoices with our AI collections agent.`,
      },
      {
        id: "gdrive-ib-li-engagers-a1-dm1",
        label: "DM 1",
        channel: "linkedin",
        body: `Hey {{firstName|there}}, thanks for connecting.

Was wondering if aging invoices are a problem for {{companyName}}? Asking as many other companies in {{industryName}} mention that they have more than 30% overdue invoices every month.

We built an AI agent that fills this gap as your fractional AR team. It's chasing until the invoice is settled, and when needed, our team texts and calls when emails are ineffective.

Open to learning more about it?`,
      },
      {
        id: "gdrive-ib-li-engagers-a1-dm2",
        label: "DM 2",
        channel: "linkedin",
        body: `Outstanding invoices are a problem every scaling business has.

For example, Doppler had a one-person finance team and subscriptions were growing. Implementing automated follow-ups and texts recovered thousands in lost revenue.

Worth 15 minutes to see if it makes sense for your team?`,
      },
    ],
  },

  {
    id: "gdrive-ib-li-engagers-a2",
    name: "LinkedIn Engagers - Angle 2",
    client: "Invoice Butler",
    channel: "LinkedIn",
    positiveReplies: 0,
    positiveReplyRate: null,
    replyRate: null,
    status: null,
    decisionMakers: "",
    angle: "",
    masterRecordId: null,
    category: "signal",
    subcategory: "linkedin_engagement",
    steps: [
      {
        id: "gdrive-ib-li-engagers-a2-dm1a",
        label: "DM 1 (Variant A)",
        channel: "linkedin",
        body: `Hey {{firstName|there}}, appreciate the connection.

How are you handling overdue invoices at {{companyName|your end}} at the moment?

Asking because we built an AI agent that handles all follow-ups on late invoices, helping companies like {{companyName}} gain thousands in lost revenue. Worth a chat?`,
      },
      {
        id: "gdrive-ib-li-engagers-a2-dm1b",
        label: "DM 1 (Variant B)",
        channel: "linkedin",
        body: `Hey {{firstName|there}}, {{RANDOM | thanks for connecting | appreciate the connection}}

I help scaling start-ups recover lost revenue and dead time chasing late invoices by implementing an AI agent to chase late invoices.`,
      },
      {
        id: "gdrive-ib-li-engagers-a2-dm2",
        label: "DM 2",
        channel: "linkedin",
        body: `To add some context to my previous message.

We helped Beewise collect 1 million dollars in outstanding invoices in 30 days. We did this by automating the entire collections process with AI, and when they didn't respond, we called them.

{{RANDOM | Is this relevant to {{companyName}} | Worth a look? }}`,
      },
    ],
  },

  {
    id: "gdrive-ib-li-visitors-a1",
    name: "LinkedIn Website Visitors - Angle 1",
    client: "Invoice Butler",
    channel: "LinkedIn",
    positiveReplies: 0,
    positiveReplyRate: null,
    replyRate: null,
    status: null,
    decisionMakers: "",
    angle: "",
    masterRecordId: null,
    category: "signal",
    subcategory: "website_visitor",
    steps: [
      {
        id: "gdrive-ib-li-visitors-a1-dm1",
        label: "DM 1",
        channel: "linkedin",
        body: `Hi {{firstName|there}}, thanks for connecting!

Saw {{companyName|your team}} come up on our end. Most teams we work with hand over collections to whoever has time, sometimes in the finance department.

Is this roughly how it runs at your end?`,
      },
      {
        id: "gdrive-ib-li-visitors-a1-dm2",
        label: "DM 2",
        channel: "linkedin",
        body: `Asking because it is usually a few hours a week before anyone notices it has become a job.

We picked that up for Doppler, whose finance team is one person. Worth a conversation?`,
      },
      {
        id: "gdrive-ib-li-visitors-a1-dm3",
        label: "DM 3",
        channel: "linkedin",
        body: `Leaving it there {{firstName}}.

If chasing invoices ever turns into the thing eating your month, I am easy to find.`,
      },
    ],
  },

  {
    id: "gdrive-ib-li-visitors-a2",
    name: "LinkedIn Website Visitors - Angle 2",
    client: "Invoice Butler",
    channel: "LinkedIn",
    positiveReplies: 0,
    positiveReplyRate: null,
    replyRate: null,
    status: null,
    decisionMakers: "",
    angle: "",
    masterRecordId: null,
    category: "signal",
    subcategory: "website_visitor",
    steps: [
      {
        id: "gdrive-ib-li-visitors-a2-dm1",
        label: "DM 1",
        channel: "linkedin",
        body: `Hi {{firstName|there}}, thanks for connecting!

How are you keeping on top of overdue invoices at the moment?

Asking because I spoke to a head of finance last week who found about 5% of their annual revenue sitting in late invoices, and had no idea until they looked.`,
      },
      {
        id: "gdrive-ib-li-visitors-a2-dm2",
        label: "DM 2",
        channel: "linkedin",
        body: `Asking because that is usually the 90 plus day pile everyone has quietly given up on. Basis Theory pulled back over 150k of it in four months and cut DSO by a third.

Worth a look at yours?`,
      },
      {
        id: "gdrive-ib-li-visitors-a2-dm3",
        label: "DM 3",
        channel: "linkedin",
        body: `Leaving this one here {{firstName| }}.

If that pile ever gets annoying enough to do something about, drop me a line.`,
      },
    ],
  },

  {
    id: "gdrive-ib-li-visitors-a3",
    name: "LinkedIn Website Visitors - Angle 3",
    client: "Invoice Butler",
    channel: "LinkedIn",
    positiveReplies: 0,
    positiveReplyRate: null,
    replyRate: null,
    status: null,
    decisionMakers: "",
    angle: "",
    masterRecordId: null,
    category: "signal",
    subcategory: "website_visitor",
    steps: [
      {
        id: "gdrive-ib-li-visitors-a3-dm1",
        label: "DM 1",
        channel: "linkedin",
        body: `Hi {{firstName|there}}, Kristina here, I run Invoice Butler. We do automated AR follow-up for B2B companies.

Have you got something automated chasing your overdue invoices?`,
      },
      {
        id: "gdrive-ib-li-visitors-a3-dm2",
        label: "DM 2",
        channel: "linkedin",
        body: `Asking because it is usually a few hours a week before anyone notices it has become a job and you have to hire an "AR" role.

Is this something you care about?`,
      },
    ],
  },

  {
    id: "gdrive-ib-li-visitors-a4",
    name: "LinkedIn Website Visitors - Angle 4",
    client: "Invoice Butler",
    channel: "LinkedIn",
    positiveReplies: 0,
    positiveReplyRate: null,
    replyRate: null,
    status: null,
    decisionMakers: "",
    angle: "",
    masterRecordId: null,
    category: "signal",
    subcategory: "website_visitor",
    steps: [
      {
        id: "gdrive-ib-li-visitors-a4-dm1",
        label: "DM 1",
        channel: "linkedin",
        body: `Hi {{firstName|there}}, Kristina here, I run Invoice Butler and saw your company on our end. If you are thinking about implementing automated collections lmk.

Happy to have a chat.`,
      },
      {
        id: "gdrive-ib-li-visitors-a4-dm2",
        label: "DM 2",
        channel: "linkedin",
        body: `Just a note we are different to other vendors, we actually have a team of humans that follow up for you on accounts emails don't win over.`,
      },
    ],
  },

  {
    id: "gdrive-ib-li-visitors-a5",
    name: "LinkedIn Website Visitors - Angle 5",
    client: "Invoice Butler",
    channel: "LinkedIn",
    positiveReplies: 0,
    positiveReplyRate: null,
    replyRate: null,
    status: null,
    decisionMakers: "",
    angle: "",
    masterRecordId: null,
    category: "signal",
    subcategory: "website_visitor",
    steps: [
      {
        id: "gdrive-ib-li-visitors-a5-conn",
        label: "Connection Request",
        channel: "linkedin",
        body: `Hey {firstName}, K here from Invoice Butler. We act as an outsourced AR team, powered by AI, so finance teams get paid faster without the hire. Would love to connect.`,
      },
      {
        id: "gdrive-ib-li-visitors-a5-dm1",
        label: "DM 1",
        channel: "linkedin",
        body: `Hey {{firstName}}, Kristina here from Invoice Butler. We act as an outsourced AR team, powered by AI, so finance teams get paid faster without the hire. Would love to connect!

Just wanted to say, Invoice Butler acts as your outsourced AR operator, handling actual emails and text. Is this something {{companyName|your team}} is thinking about?`,
      },
      {
        id: "gdrive-ib-li-visitors-a5-dm2",
        label: "DM 2",
        channel: "linkedin",
        body: `{{To add some context|To follow up on my previous message}}, when our agent is unable to get a response, our team calls companies for you (part of our service). Skyflow cut their collection time in half and recovered $1.9M with us this way. Worth a look?`,
      },
    ],
  },

  {
    id: "gdrive-ib-li-visitors-a6",
    name: "LinkedIn Website Visitors - Angle 6",
    client: "Invoice Butler",
    channel: "LinkedIn",
    positiveReplies: 0,
    positiveReplyRate: null,
    replyRate: null,
    status: null,
    decisionMakers: "",
    angle: "",
    masterRecordId: null,
    category: "signal",
    subcategory: "website_visitor",
    steps: [
      {
        id: "gdrive-ib-li-visitors-a6-dm1",
        label: "DM 1",
        channel: "linkedin",
        body: `Hey {{firstName}}, I work closely with teams on getting AR off their plate without hiring someone to do it. Thought it'd be great to connect!`,
      },
      {
        id: "gdrive-ib-li-visitors-a6-dm2",
        label: "DM 2",
        channel: "linkedin",
        body: `Thanks for connecting. If AR collections are the reason your team is losing time, I'd be happy to share what we've seen finance leads do to get it off their plate entirely.`,
      },
      {
        id: "gdrive-ib-li-visitors-a6-dm3",
        label: "DM 3",
        channel: "linkedin",
        body: `I have a couple openings tomorrow or Thursday. Want me to send a calendar invite?`,
      },
    ],
  },

  {
    id: "gdrive-ib-li-jungler-b",
    name: "LinkedIn Engagers (Jungler) - Variant B",
    client: "Invoice Butler",
    channel: "LinkedIn",
    positiveReplies: 0,
    positiveReplyRate: null,
    replyRate: null,
    status: null,
    decisionMakers: "",
    angle: "",
    masterRecordId: null,
    category: "signal",
    subcategory: "linkedin_engagement",
    steps: [
      {
        id: "gdrive-ib-li-jungler-b-dm1",
        label: "DM 1",
        channel: "linkedin",
        body: `Hey {{firstName|there}}, seen you pop up under a few of my posts so figured I'd reach out. I run Invoice Butler and we do automated AR follow-up for B2B companies.

How are you handling overdue invoices at the moment, out of curiosity?`,
      },
      {
        id: "gdrive-ib-li-jungler-b-dm2",
        label: "DM 2",
        channel: "linkedin",
        body: `It is not a problem until revenue is sitting past 90 days. We helped Basis Theory solve this, take a look.
https://www.invoicebutler.com/customer-stories/basis-theory`,
      },
    ],
  },

  {
    id: "gdrive-ib-li-jungler-c",
    name: "LinkedIn Engagers (Jungler) - Variant C",
    client: "Invoice Butler",
    channel: "LinkedIn",
    positiveReplies: 0,
    positiveReplyRate: null,
    replyRate: null,
    status: null,
    decisionMakers: "",
    angle: "",
    masterRecordId: null,
    category: "signal",
    subcategory: "linkedin_engagement",
    steps: [
      {
        id: "gdrive-ib-li-jungler-c-dm1",
        label: "DM 1",
        channel: "linkedin",
        body: `Hey {firstName}, Mihir here from Invoice Butler. Saw you engaging with my post and thought I'd reach out, we help lean finance teams collect faster without hiring an AR person. Would love to connect.`,
      },
      {
        id: "gdrive-ib-li-jungler-c-dm2",
        label: "DM 2",
        channel: "linkedin",
        body: `Since you've been following along, the short version of what we do: AI handles email & text follow ups, but our team steps in for disputes and phone calls on accounts that automations alone can't recover.

{{RANDOM|Is that a gap on your team right now, or more just something you're keeping an eye on?}}`,
      },
    ],
  },

  {
    id: "gdrive-ib-li-jungler-d",
    name: "LinkedIn Engagers (Jungler) - Variant D",
    client: "Invoice Butler",
    channel: "LinkedIn",
    positiveReplies: 0,
    positiveReplyRate: null,
    replyRate: null,
    status: null,
    decisionMakers: "",
    angle: "",
    masterRecordId: null,
    category: "signal",
    subcategory: "linkedin_engagement",
    steps: [
      {
        id: "gdrive-ib-li-jungler-d-dm1",
        label: "DM 1",
        channel: "linkedin",
        body: `Hey {firstName}, noticed you've been engaging with some of our AR content. I work with team leaders on getting collections off their plate and thought it'd be great to connect.`,
      },
      {
        id: "gdrive-ib-li-jungler-d-dm2",
        label: "DM 2",
        channel: "linkedin",
        body: `Thanks for connecting, and for engaging with the content. Happy to share what other finance leads in {{industry}} are doing to bring their DSO down, if that's useful.`,
      },
    ],
  },

  {
    id: "gdrive-ib-li-cold-a1",
    name: "LinkedIn Cold Outbound - Angle 1",
    client: "Invoice Butler",
    channel: "LinkedIn",
    positiveReplies: 0,
    positiveReplyRate: null,
    replyRate: null,
    status: null,
    decisionMakers: "",
    angle: "",
    masterRecordId: null,
    category: "cold",
    steps: [
      {
        id: "gdrive-ib-li-cold-a1-dm1",
        label: "DM 1",
        channel: "linkedin",
        body: `Hey {FIRST_NAME}, Mihir here from Invoice Butler. I'm talking to a few {roles} in your space about invoices collection - most teams have 5-7% percent of their monthly cashflow pending due to late invoices.

We built Invoice Butler to fix that - it's an AI tool that takes care of invoice collection automatically.

Open to learning more?`,
      },
    ],
  },

  {
    id: "gdrive-ib-li-cold-a2",
    name: "LinkedIn Cold Outbound - Angle 2",
    client: "Invoice Butler",
    channel: "LinkedIn",
    positiveReplies: 0,
    positiveReplyRate: null,
    replyRate: null,
    status: null,
    decisionMakers: "",
    angle: "",
    masterRecordId: null,
    category: "cold",
    steps: [
      {
        id: "gdrive-ib-li-cold-a2-dm1",
        label: "DM 1",
        channel: "linkedin",
        body: `Hey {FIRST_NAME}! Mihir from InvoiceButler here!

I've been hearing {COMPANY} come up a lot and I was wondering if you'd like to get cash in the door faster. We built an AI Agent that runs follow-ups, escalation calls, and portal submissions under your brand, so clients stay on track and your team never has to chase.

Would you be interested in learning more?

p.s Some of our clients like Skyflow recovered $1.9M and cut collection time in half with us.`,
      },
    ],
  },

  {
    id: "gdrive-ib-li-cold-a4",
    name: "LinkedIn Cold Outbound - Angle 4",
    client: "Invoice Butler",
    channel: "LinkedIn",
    positiveReplies: 0,
    positiveReplyRate: null,
    replyRate: null,
    status: null,
    decisionMakers: "",
    angle: "",
    masterRecordId: null,
    category: "cold",
    steps: [
      {
        id: "gdrive-ib-li-cold-a4-dm1",
        label: "DM 1",
        channel: "linkedin",
        body: `Hey {FIRST_NAME}! Mihir from InvoiceButler here!

I've been hearing {COMPANY} come up a lot and I was wondering if you'd like to get cash in the door faster.

We built an AI Agent that follows up on unpaid invoices, fills out all supplier portals, keeps everything centralized, and does it for a fraction of the cost of hiring an AR team or hiring a contractor/doing it internally.

Would you be open to learning more?`,
      },
    ],
  },

  {
    id: "gdrive-ib-li-cold-a5",
    name: "LinkedIn Cold Outbound - Angle 5",
    client: "Invoice Butler",
    channel: "LinkedIn",
    positiveReplies: 0,
    positiveReplyRate: null,
    replyRate: null,
    status: null,
    decisionMakers: "",
    angle: "",
    masterRecordId: null,
    category: "cold",
    steps: [
      {
        id: "gdrive-ib-li-cold-a5-dm1",
        label: "DM 1",
        channel: "linkedin",
        body: `Hey {FIRST_NAME}, Mihir here from Invoice Butler. I'm talking to a few {roles} in your space about invoices collection - most teams have 5-7% percent of their monthly cashflow pending due to late invoices.

We built Invoice Butler to take this manual process off of your plate and make sure you are getting all their invoices paid on time.

Open to learning more?`,
      },
    ],
  },

  // ── FULLENRICH ────────────────────────────────────────────────────────────

  {
    id: "gdrive-fe-li-brand-sales",
    name: "LinkedIn Brand Mentions - Sales",
    client: "FullEnrich",
    channel: "LinkedIn",
    positiveReplies: 0,
    positiveReplyRate: null,
    replyRate: null,
    status: null,
    decisionMakers: "",
    angle: "",
    masterRecordId: null,
    category: "signal",
    subcategory: "linkedin_engagement",
    steps: [
      {
        id: "gdrive-fe-li-brand-sales-dm1a",
        label: "DM 1 (Variant A)",
        channel: "linkedin",
        body: `Hey {{firstName}}, {{relevancyPersonalisation}}. If you don't mind me asking, what's the fallback when a rep can't find a direct mobile number?`,
      },
      {
        id: "gdrive-fe-li-brand-sales-dm1b",
        label: "DM 1 (Variant B)",
        channel: "linkedin",
        body: `Hey {{firstName}}, {{relevancyPersonalisation}}. Is the team still using a single data vendor to source mobile numbers?`,
      },
      {
        id: "gdrive-fe-li-brand-sales-dm2a",
        label: "DM 2 (Variant A)",
        channel: "linkedin",
        body: `With one data vendor there is no fallback. Your rep hits a dead end.

FullEnrich pulls from 20+ sources so when one comes up short, another picks it up.

I could show how extensive our coverage is if you have a list you'd like enriched?`,
      },
      {
        id: "gdrive-fe-li-brand-sales-dm2b",
        label: "DM 2 (Variant B)",
        channel: "linkedin",
        body: `Most sales teams I speak to rely on a single vendor for contact data. If that vendor draws a blank the rep has no choice but to move on.

FullEnrich searches across 20+ sources automatically to give your team the best chance possible to connect with their lead.

Could the team benefit from wider coverage?`,
      },
    ],
  },

  {
    id: "gdrive-fe-li-brand-marketing",
    name: "LinkedIn Brand Mentions - Marketing",
    client: "FullEnrich",
    channel: "LinkedIn",
    positiveReplies: 0,
    positiveReplyRate: null,
    replyRate: null,
    status: null,
    decisionMakers: "",
    angle: "",
    masterRecordId: null,
    category: "signal",
    subcategory: "linkedin_engagement",
    steps: [
      {
        id: "gdrive-fe-li-brand-mkt-dm1a",
        label: "DM 1 (Variant A)",
        channel: "linkedin",
        body: `Hey {{firstName}}, {{relevancyPersonalisation}}. Quick question, are you confident your current tool is finding every contact in your ICP?`,
      },
      {
        id: "gdrive-fe-li-brand-mkt-dm1b",
        label: "DM 1 (Variant B)",
        channel: "linkedin",
        body: `Hey {{firstName}}, {{relevancyPersonalisation}}. Quick question, how many data sources are your team pulling emails and phone numbers from?`,
      },
      {
        id: "gdrive-fe-li-brand-mkt-dm2",
        label: "DM 2",
        channel: "linkedin",
        body: `Single source tools have gaps. The contacts they miss are ones your campaigns never touch and your competitors might be reaching.

FullEnrich searches across 20+ sources to give you the full picture of your ICP.

Want to see the difference on your own lists?`,
      },
    ],
  },

  {
    id: "gdrive-fe-li-brand-growth",
    name: "LinkedIn Brand Mentions - Growth",
    client: "FullEnrich",
    channel: "LinkedIn",
    positiveReplies: 0,
    positiveReplyRate: null,
    replyRate: null,
    status: null,
    decisionMakers: "",
    angle: "",
    masterRecordId: null,
    category: "signal",
    subcategory: "linkedin_engagement",
    steps: [
      {
        id: "gdrive-fe-li-brand-growth-dm1a",
        label: "DM 1 (Variant A)",
        channel: "linkedin",
        body: `Hey {firstName}, nice to connect, {relevancyPersonalisation}. Is the team relying on a single data vendor to find phone numbers and emails?`,
      },
      {
        id: "gdrive-fe-li-brand-growth-dm1b",
        label: "DM 1 (Variant B)",
        channel: "linkedin",
        body: `Hey {firstName}, {relevancyPersonalisation}. How many data sources are your team pulling emails/ phone numbers from? Might have something for you here.`,
      },
      {
        id: "gdrive-fe-li-brand-growth-dm2",
        label: "DM 2",
        channel: "linkedin",
        body: `A single data vendor means a single point of failure. When they don't have a contact, that gap stays in your CRM.

FullEnrich pulls from 20+ sources automatically - so when one misses, another picks it up.`,
      },
    ],
  },

  {
    id: "gdrive-fe-li-brand-agencies",
    name: "LinkedIn Brand Mentions - Agencies",
    client: "FullEnrich",
    channel: "LinkedIn",
    positiveReplies: 0,
    positiveReplyRate: null,
    replyRate: null,
    status: null,
    decisionMakers: "",
    angle: "",
    masterRecordId: null,
    category: "signal",
    subcategory: "linkedin_engagement",
    steps: [
      {
        id: "gdrive-fe-li-brand-agencies-dm1a",
        label: "DM 1 (Variant A)",
        channel: "linkedin",
        body: `Hey {firstName}, nice to connect, {relevancyPersonalisation}. Do you ever feel like gaps in contact data are holding back results for your clients?`,
      },
      {
        id: "gdrive-fe-li-brand-agencies-dm1b",
        label: "DM 1 (Variant B)",
        channel: "linkedin",
        body: `Hey {firstName}, I've seen {relevancyPersonalisation}. Do you ever feel like gaps in contact data are holding back results for your clients?`,
      },
      {
        id: "gdrive-fe-li-brand-agencies-dm2",
        label: "DM 2",
        channel: "linkedin",
        body: `Most agencies build client lists from the same pool of contacts - creating the same gaps.

FullEnrich pulls from 20+ sources so you're finding contacts other agencies can't. More coverage means more conversations for your clients.

Want to see the difference on a client list?`,
      },
    ],
  },

  // ── MOMENTIC ──────────────────────────────────────────────────────────────

  {
    id: "gdrive-momentic-li-visitors-a",
    name: "LinkedIn Website Visitors - Variant A",
    client: "Momentic",
    channel: "LinkedIn",
    positiveReplies: 0,
    positiveReplyRate: null,
    replyRate: null,
    status: null,
    decisionMakers: "",
    angle: "",
    masterRecordId: null,
    category: "signal",
    subcategory: "website_visitor",
    steps: [
      {
        id: "gdrive-momentic-li-visitors-a-dm1",
        label: "DM 1",
        channel: "linkedin",
        body: `Hey {firstName}, {relevancyPersonalization}

Curious if testing's a bottleneck at {{companyNameShortened}}? Notion's scaled coverage to 400k+ tests per day with near zero upkeep using Momentic.

Worth seeing how they got there? I can send a quick Loom.`,
      },
      {
        id: "gdrive-momentic-li-visitors-a-dm2",
        label: "DM 2",
        channel: "linkedin",
        body: `Retool recently turned their 15-page QA checklist into automated E2E tests. Their team's shipping 8x faster after implementing Momentic.

I'd be happy to run a few tests for you and share issues your current QA process is missing?`,
      },
    ],
  },

  {
    id: "gdrive-momentic-li-visitors-b",
    name: "LinkedIn Website Visitors - Variant B",
    client: "Momentic",
    channel: "LinkedIn",
    positiveReplies: 0,
    positiveReplyRate: null,
    replyRate: null,
    status: null,
    decisionMakers: "",
    angle: "",
    masterRecordId: null,
    category: "signal",
    subcategory: "website_visitor",
    steps: [
      {
        id: "gdrive-momentic-li-visitors-b-dm1",
        label: "DM 1",
        channel: "linkedin",
        body: `Hey {{firstName}}, {relevancyPersonalization}

Notion's QA team spent 70% of their time maintaining tests. Since switching to Momentic, they cut maintenance to near zero and increased coverage to 400k+ tests per day.

Can I send a quick Loom showing how we'd eliminate QA maintenance for {{companyNameShortened}}?`,
      },
      {
        id: "gdrive-momentic-li-visitors-b-dm2",
        label: "DM 2",
        channel: "linkedin",
        body: `Retool ships 8x faster after automating their 15-page QA checklist with Momentic.

I'd be happy to configure a testing environment against your code base, no lift on your end.

Just join a call, hit start, and watch Momentic surface critical issues you didn't know about.`,
      },
    ],
  },

  // ── MEDRIO ────────────────────────────────────────────────────────────────

  {
    id: "gdrive-medrio-li-biopharma-a",
    name: "LinkedIn Biopharma VPs - Variant A",
    client: "Medrio",
    channel: "LinkedIn",
    positiveReplies: 0,
    positiveReplyRate: null,
    replyRate: null,
    status: null,
    decisionMakers: "",
    angle: "",
    masterRecordId: null,
    category: "cold",
    steps: [
      {
        id: "gdrive-medrio-li-biopharma-a-dm1",
        label: "DM 1",
        channel: "linkedin",
        body: `Hey {first name}, {AI Personalised line - noticed you have Roxadustat in development for Anemia in lower-risk MDS}.

The EDC you pick early on has a way of eating into runway faster than expected - either through enterprise change orders or a cheaper tool that can't keep up as you scale.

Medrio is built for sponsors at your stage. Intellia Therapeutics and United Therapeutics both ran on Medrio from early phase through Phase 3 without switching.

Worth a quick chat if you're in the process of evaluating?`,
      },
      {
        id: "gdrive-medrio-li-biopharma-a-fu1",
        label: "Follow-up 1",
        channel: "linkedin",
        body: `Hey {first_name}, just wanted to add some more context.

Most sponsors at your stage end up paying for EDC twice - once with the license, once with the time lost when a cheaper tool doesn't scale.

Medrio customers typically spend 30-50% less than enterprise options and avoid the mid-trial switch.

Happy to send a couple of case studies if useful?`,
      },
      {
        id: "gdrive-medrio-li-biopharma-a-fu2",
        label: "Follow-up 2",
        channel: "linkedin",
        body: `Hey {first_name}, just wanted to add some more context.

The 30-50% cost difference vs enterprise EDC tends to compound fast at your stage - it's not just the license, it's the change orders, the implementation time, and the months you lose if you outgrow a cheaper tool mid-trial.

Most Medrio customers picked us specifically to avoid both ends of that. Worth a quick call to see if it's a fit?`,
      },
    ],
  },

  {
    id: "gdrive-medrio-li-biopharma-b",
    name: "LinkedIn Biopharma VPs - Variant B",
    client: "Medrio",
    channel: "LinkedIn",
    positiveReplies: 0,
    positiveReplyRate: null,
    replyRate: null,
    status: null,
    decisionMakers: "",
    angle: "",
    masterRecordId: null,
    category: "cold",
    steps: [
      {
        id: "gdrive-medrio-li-biopharma-b-dm1",
        label: "DM 1",
        channel: "linkedin",
        body: `Hey {first name}, EDC decisions at your stage tend to create problems in one of two directions - overpaying for enterprise infrastructure you don't need yet, or under-investing and having to switch mid-trial.

Medrio sits in between. Companies like Intellia Therapeutics and United Therapeutics ran on it from early phase through Phase 3 without switching systems.

Open to a quick conversation if EDC is on your radar?`,
      },
      {
        id: "gdrive-medrio-li-biopharma-b-fu1",
        label: "Follow-up 1",
        channel: "linkedin",
        body: `Hey {first_name}, just wanted to add some more context.

Most sponsors at your stage end up paying for EDC twice - once with the license, once with the time lost when a cheaper tool doesn't scale.

Medrio customers typically spend 30-50% less than enterprise options and avoid the mid-trial switch.

Happy to send a couple of case studies if useful?`,
      },
      {
        id: "gdrive-medrio-li-biopharma-b-fu2",
        label: "Follow-up 2",
        channel: "linkedin",
        body: `Hey {first_name}, just wanted to add some more context.

The 30-50% cost difference vs enterprise EDC tends to compound fast at your stage - it's not just the license, it's the change orders, the implementation time, and the months you lose if you outgrow a cheaper tool mid-trial.

Most Medrio customers picked us specifically to avoid both ends of that. Worth a quick call to see if it's a fit?`,
      },
    ],
  },

  {
    id: "gdrive-medrio-li-newhire-a",
    name: "LinkedIn New Hires - Variant A",
    client: "Medrio",
    channel: "LinkedIn",
    positiveReplies: 0,
    positiveReplyRate: null,
    replyRate: null,
    status: null,
    decisionMakers: "",
    angle: "",
    masterRecordId: null,
    category: "signal",
    subcategory: "new_hire",
    steps: [
      {
        id: "gdrive-medrio-li-newhire-a-dm1",
        label: "DM 1",
        channel: "linkedin",
        body: `Hey {{FirstName}}, saw you recently joined {{companyName}} - congrats.

When programs start ramping in {{Industry}}, data management usually ends up heavier than teams planned for.

Medrio cuts that workload by ~43% and scales as you grow. Open to sharing how {{Peer}} and a few other {{Industry}} teams approached it?`,
      },
      {
        id: "gdrive-medrio-li-newhire-a-fu",
        label: "Follow-up",
        channel: "linkedin",
        body: `Hi {{firstName}},

A few {{Industry}} teams we work with picked their EDC early on - and realized later it wasn't going to scale.

They needed something that grows with them, without big pharma complexity. That's where Medrio fits.

Does your current setup hold up as programs ramp?

Best,
{{accountSignature}}`,
      },
    ],
  },

  {
    id: "gdrive-medrio-li-newhire-b",
    name: "LinkedIn New Hires - Variant B",
    client: "Medrio",
    channel: "LinkedIn",
    positiveReplies: 0,
    positiveReplyRate: null,
    replyRate: null,
    status: null,
    decisionMakers: "",
    angle: "",
    masterRecordId: null,
    category: "signal",
    subcategory: "new_hire",
    steps: [
      {
        id: "gdrive-medrio-li-newhire-b-dm1",
        label: "DM 1",
        channel: "linkedin",
        body: `Hey {{FirstName}}, congrats on the new role at {{companyName}}.

Most {{Industry}} teams don't feel the EDC burden until studies are already moving - by then switching is expensive and slow.

Medrio is built to handle that from day one. {{Peer}} has been running on it since early phase - want me to share what that looked like?`,
      },
    ],
  },

  {
    id: "gdrive-medrio-li-newhire-c",
    name: "LinkedIn New Hires - Variant C",
    client: "Medrio",
    channel: "LinkedIn",
    positiveReplies: 0,
    positiveReplyRate: null,
    replyRate: null,
    status: null,
    decisionMakers: "",
    angle: "",
    masterRecordId: null,
    category: "signal",
    subcategory: "new_hire",
    steps: [
      {
        id: "gdrive-medrio-li-newhire-c-dm1",
        label: "DM 1",
        channel: "linkedin",
        body: `Hey {{FirstName}}, congrats on joining {{companyName}}.

The first few months in a role like this usually means figuring out which systems can actually scale with your programs and which ones can't.

EDC is usually where that breaks down first. Happy to show you what Medrio looks like for a team at your stage?`,
      },
    ],
  },

  // ── LEXROOM ───────────────────────────────────────────────────────────────

  {
    id: "gdrive-lexroom-li-engager-a",
    name: "LinkedIn Engagers - Variant A",
    client: "Lexroom",
    channel: "LinkedIn",
    positiveReplies: 0,
    positiveReplyRate: null,
    replyRate: null,
    status: null,
    decisionMakers: "",
    angle: "",
    masterRecordId: null,
    category: "signal",
    subcategory: "linkedin_engagement",
    steps: [
      {
        id: "gdrive-lexroom-li-engager-a-dm1",
        label: "DM 1",
        channel: "linkedin",
        body: `Buongiorno Avv. {{lastName}}, un piacere connetterci qui! Ho visto che anche lei è iscritta all'ordine di {{city}}.

Qui noto sempre più studi legali adottano ChatGPT/Copilot per bozze di pareri o contratti. Anche lei li usa?

Non so se conosce Lexroom (può vedere nel mio profilo più dettagli)...è una piattaforma IA specializzata sulla normativa di legge italiana.

I nostri clienti risparmiano 11-15 ore/settimana su attività manuali.

Posso mandarle un video che fa vedere come funziona? Sono sicuro che rimarrà sorpreso dall'efficienza.`,
      },
      {
        id: "gdrive-lexroom-li-engager-a-fu",
        label: "Follow-up",
        channel: "linkedin",
        body: `Buongiorno Avv. [ ],

Non ha risposto al mio precedente messaggio perché usa già un tool di IA, o perché al momento non è interessato?

Se vuole, posso inviarle il link per una prova gratuita: in genere aiuta a risparmiare tempo su attività manuali (in media 11–15 ore/settimana per studi come LCA, Withers e Mediolanum).

Vuole il link?`,
      },
    ],
  },

  {
    id: "gdrive-lexroom-li-geolocation",
    name: "LinkedIn Nearby Firm (Geolocation)",
    client: "Lexroom",
    channel: "LinkedIn",
    positiveReplies: 0,
    positiveReplyRate: null,
    replyRate: null,
    status: null,
    decisionMakers: "",
    angle: "",
    masterRecordId: null,
    category: "cold",
    steps: [
      {
        id: "gdrive-lexroom-li-geolocation-dm1",
        label: "DM 1",
        channel: "linkedin",
        body: `Gentile Avv. {{lastName}}, è un piacere connetterci qui!

ho parlato recentemente con lo studio {{nome studio geograficamente vicino}}, vicino a lei in zona {{indirizzo}}, sul tema emergente d'IA.

Non so se conosce Lexroom (può vedere nel mio profilo più dettagli)...è una piattaforma IA specializzata sulla normativa di legge italiana.

Le andrebbe di prendere un caffè {{indirizzo bar}} per mostrarle un esempio pratico? Sarò in zona domani verso le 14:00.`,
      },
    ],
  },

  {
    id: "gdrive-lexroom-li-fallback",
    name: "LinkedIn Fallback / Cold",
    client: "Lexroom",
    channel: "LinkedIn",
    positiveReplies: 0,
    positiveReplyRate: null,
    replyRate: null,
    status: null,
    decisionMakers: "",
    angle: "",
    masterRecordId: null,
    category: "cold",
    steps: [
      {
        id: "gdrive-lexroom-li-fallback-dm1",
        label: "DM 1",
        channel: "linkedin",
        body: `Salve Avvocato è un piacere connetterci qui!

Vedo che sempre più professionisti introducono l'IA nel lavoro legale, ma con risultati altalenanti… lei ha già provato qualche strumento?

Non so se conosce Lexroom (può vedere nel mio profilo più dettagli)...è una piattaforma IA specializzata sulla normativa di legge italiana.

È già usata da 5.000+ avvocati, in studi come Gatti Pavesi Bianchi Ludovici, Gianni & Origoni, WST e LCA.

Vorremmo renderlo più accessibile anche a realtà più snelle come la sua.

Ho creato un'istanza di demo in modo che possa valutare con quanta precisione l'IA tratta il diritto e le leggi italiane.

Vuole vederla?`,
      },
      {
        id: "gdrive-lexroom-li-fallback-dm2",
        label: "Follow-up",
        channel: "linkedin",
        body: `Gentile Avv. {{lastName}},

Le ho creato l'istanza di demo che mostra il motivo per cui i nostri clienti risparmiano 11-15 ore a settimana, la trova in questo video:

[LINK di Loom]

Sarebbe contraria a parlarne per 6 minuti?`,
      },
    ],
  },

  {
    id: "gdrive-lexroom-li-website-visitors",
    name: "LinkedIn Website Visitors",
    client: "Lexroom",
    channel: "LinkedIn",
    positiveReplies: 0,
    positiveReplyRate: null,
    replyRate: null,
    status: null,
    decisionMakers: "",
    angle: "",
    masterRecordId: null,
    category: "signal",
    subcategory: "website_visitor",
    steps: [
      {
        id: "gdrive-lexroom-li-wv-dm1",
        label: "DM 1",
        channel: "linkedin",
        body: `Gentile Avv. [ ], un piacere connetterci qui.

Ha mai considerato un assistente IA per agevolare il suo lavoro? (soprattutto le attività più ripetitive).`,
      },
    ],
  },

  {
    id: "gdrive-lexroom-li-enterprise",
    name: "LinkedIn Enterprise (In-House Legal)",
    client: "Lexroom",
    channel: "LinkedIn",
    positiveReplies: 0,
    positiveReplyRate: null,
    replyRate: null,
    status: null,
    decisionMakers: "",
    angle: "",
    masterRecordId: null,
    category: "cold",
    steps: [
      {
        id: "gdrive-lexroom-li-enterprise-dm1",
        label: "DM 1",
        channel: "linkedin",
        body: `Gentile Avv. XXX,

sono Cristian Casili di Lexroom.ai. Piacere di connettermi!

Lexroom è una piattaforma AI per team legal in-house già usata da realtà come [NAME DROPPING AZIENDE STESSA INDUSTRY] in attività di ricerca giuridica, compliance, revisione contratti e due diligence documentale.

Le farebbe piacere una breve videocall di 15 minuti per vedere come i vostri team in [NOME AZIENDA] potrebbero concretamente beneficiarne?

Grazie e a presto!`,
      },
    ],
  },
];
