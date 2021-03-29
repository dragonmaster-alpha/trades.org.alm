// Supported Merge Tags: https://coda.io/d/Marketing_dgiWauZtMH7/Supported-Abilities_sug5h#_luFHN
// Categories: https://coda.io/d/Categories_d0l_Jlcedz0/Category-Grammar_su8XK#Category-Grammar-Mappings_tuO4K/r20

module.exports.intro_are_you_still_in_business = {
    name: "Are you still in business?",
    description: "Opens with asking if they're in business. Then agent would lead with 'well, your website is down'.",
    steps: [
        {
            action: "communication",
            channel: "sms",
            message: [
                "Hi, is this {{business_name}}?",
                "Hi, is this {{website}}?",
                "Are you {{17_website}}?",
                "Are you {{business_name}}?",
                "Is this the number for {{website}}?",
                "Is this the number for {{business_name}}?",
            ]
        },
        {
            // Support days, hours, minutes, and seconds, and add them up when more than one key provided.
            action: "wait",
            delay: {
                seconds: 8
            },
        },
        {
            action: "communication",
            channel: "sms",
            message: [
                "Did y'all go out of business?",
                "Did you shut down?",
                "Are you still in business?",
                "Have y'all survived the COVID shutdown?",
            ]
        },
        {
            // Random takes an array with two dictionaries: the minimum and maximum value for the delays.
            // Each dictionary is converted to seconds, and the designated wait time is some value in between.
            // If this is relatively easy to implement, please do it. I want to try to spread our messages out
            // so they don't all go out at the same time (and potentially throttle us).
            // Separately, we should consider per-number throttling to and just queue messages as necessary.
            action: "wait",
            random: [
                { hours: 8 }, { hours: 12 }
            ]

        },
        {
            action: "communication",
            channel: "sms",
            message: [
                "If you're busy just let me know when is good for you.",
                "If y'all are fully booked, just let me know!",
                "Shoot me a text when you have a minute to chat",
                "I'd love to chat when you have a sec"
            ]
        },
        {
            action: "wait",
            random: [
                { hours: 18 }, { hours: 24 }
            ]
        },
        {
            action: "communication",
            channel: "sms",
            message: [
                "Are y'all not taking on new work?",
                "Are you not doing work anymore?",
                "Are you not serving {{city}} any more?",
                "Are you still in {{city}}?"
            ]
        },
        {
            action: "wait",
            random: [
                { hours: 18 }, { hours: 24 }
            ]
        },
        {
            action: "communication",
            channel: "sms",
            message: [
                "Sorry, did I get the wrong number?",
                "Is this not {{business_name}}?",
                "Are you not {{website}}?",
            ]
        },
        {
            action: "wait",
            random: [
                { hours: 48 }, { hours: 96 }
            ],
        },
        {
            action: "communication",
            channel: "sms",
            message: [
                "Sorry for the disruption. I'll update FB/Google/Yelp that this is a closed business.",
                "One last try before I update Google/FB/Yelp/etc with your closure.",
                "Apologies for disturbance. Will update goog/fb/yelp that this is wrong number.",
            ]
        },
    ]
};

module.exports.intro_website_down_ambiguous = {
    name: "Your website is down - ambiguous.",
    description: "Opens with 'your website is down' and doesn't advertise our offerings.'",
    steps: [
        {
            action: "communication",
            channel: "sms",
            message: [
                "Hey, your website isn't working. Are you still in business?",
                "Hey, your URL is broken. Did you shut down?",
                "Is this {{website}}? Your site isn't loading.",
                "Did y'all go out of business? {{website}} isn't working.",
            ]
        },
        {
            action: "wait",
            random: [
                { hours: 4 }, { hours: 8 }
            ],
        },
        {
            action: "communication",
            channel: "sms",
            message: [
                "If now isn't a good time, let me know when you're free",
                "If you're busy just let me know when is good for you.",
                "Please hit me up when you have a minute",
                "Please give me a call when you have a sec",
            ]
        },
        {
            action: "wait",
            random: [
                { hours: 12 }, { hours: 36 }
            ],
        },
        {
            action: "communication",
            channel: "sms",
            message: [
                "Or do I have the wrong number?",
                "Or are you not {{business_name}}?",
                "Sorry, did I get the wrong number?",
                "Is this not {{business_name}}?",
                "Are you not {{website}}?",
            ]
        },
        {
            action: "wait",
            random: [
                { hours: 18 }, { hours: 24 }
            ]
        },
        {
            action: "communication",
            channel: "sms",
            message: [
                "Are y'all not taking on new work?",
                "Are you not doing work anymore?",
                "Are you not serving {{city}} any more?",
                "Are you still in {{city}}?"
            ]
        },
        {
            action: "wait",
            random: [
                { hours: 24 }, { hours: 96 }
            ]
        },
        {
            action: "communication",
            channel: "sms",
            message: [
                "Sorry for the disruption. I'll update FB/Google/Yelp that this is a closed business.",
                "One last try before I update Google/FB/Yelp/etc with your closure.",
                "Apologies for disturbance. Will update goog/fb/yelp that this is wrong number.",
            ]
        },
    ]
};

module.exports.intro_website_down_direct = {
    name: "Your website is down - direct offer.",
    description: "Opens with 'your website is down' and then advertises our offerings.'",
    steps: [
        {
            action: "communication",
            channel: "sms",
            message: [
                "Hey, want your website fixed?",
                "Your website isn't working. Want help setting it up?",
                "Your website is broken. Want it fixed?",
                "{{website}} is broken. Want it fixed?",
                "Struggling to find work, I can get {{website}} up and running again",
                "Want to win more jobs? I can get your website back up",
                "Looking to win more jobs? You need to get {{website}} fixed",
                "I can help you get {{website}} working again",
                "I can help you get your website working again"
            ]
        },
        {
            action: "wait",
            random: [
                { seconds: 10 }, { seconds: 30 }
            ],
        },
        {
            action: "communication",
            channel: "sms",
            message: [
                "It's less than an hour of your time and $33 bucks",
                "Your site can be set up in twenty minutes for the cost of two 12-packs",
                "{{website}} can be up and running for the cost of two 12-packs",
                "{{website}} can have a professional website for just $33/month",
                "I can have {{website}} back online in less than 20 minutes",
            ]
        },
        {
            action: "wait",
            random: [
                { hours: 1 }, { hours: 3 }
            ],
        },
        {
            action: "communication",
            channel: "sms",
            message: [
                "Trust drives business. People won't trust you if they can't find you online",
                "Trust wins jobs. Make it easy for people to find you so they know they can trust you",
                "When a lead can't reach your website, they'll worry they can't trust you",
                "Customers want to research you before they buy. You should make it easy for them"
            ]
        },
        {
            action: "wait",
            random: [
                { hours: 1 }, { hours: 3 }
            ],
        },
        {
            action: "communication",
            channel: "sms",
            message: [
                "If now isn't a good time, let me know when you're free",
                "If you're busy just let me know when is good for you.",
                "We can hop on a 10 minute call and I can walk you through fixing your site",
                "Please give me a call when you have a sec",
            ]
        },
        {
            action: "wait",
            random: [
                { hours: 12 }, { hours: 36 }
            ],
        },
        {
            action: "communication",
            channel: "sms",
            message: [
                "Or do I have the wrong number?",
                "Or are you not {{business_name}}?",
                "Sorry, did I get the wrong number?",
                "Is this not {{business_name}}?",
                "Are you not {{website}}?",
            ]
        },
        {
            action: "wait",
            random: [
                { hours: 18 }, { hours: 24 }
            ]
        },
        {
            action: "communication",
            channel: "sms",
            message: [
                "Sorry for the disruption. I'll update FB/Google/Yelp that this is a closed business.",
                "One last try before I update Google/FB/Yelp/etc with your closure.",
                "Apologies for disturbance. Will update goog/fb/yelp that this is wrong number.",
            ]
        },
    ]
};

module.exports.intro_hard_sell = {
    name: "Hard sell",
    description: "",
    steps: [
        {
            action: "communication",
            channel: "sms",
            message: [
                "People are four times more likely to hire a pro with a professional online brand.",
                "On average, pros with websites do 5.4x more business. They close bigger jobs more often.",
                "Pros with websites can charge 38% more than their less professional competitors.",
                "Pros with a website and good reviews are 3x more likely to close a job",
                "Pros that look professional win more deals and win bigger deals.",
                "Customers prefer pros with websites five to one. Why is your site down?",
                "People buy based on trust. How someone trust you if your website is down??"
            ]
        },
        {
            action: "wait",
            random: [
                { seconds: 10 }, { seconds: 20 }
            ],
        },
        {
            action: "communication",
            channel: "sms",
            message: [
                "It's all about trust. If a person can't find you, they can't trust you",
                "Trust drives business. People won't trust you if they can't find you online",
                "It's because of trust. Trust wins jobs, so you need to make it easier for people to trust you",
                "When a lead can't reach your website, they'll worry they can't trust you",
                "Customers want to research you before they buy. You should make it easy for them"
            ]
        },
        {
            action: "wait",
            random: [
                { hours: 1 }, { hours: 3 }
            ],
        },
        {
            action: "communication",
            channel: "sms",
            message: [
                "I can build you that trust with a website, social profiles, and good reviews",
                "I can help your business and brand earn trust by being more professional online",
                "For $33 and 33 minutes a month, you can get a professional website / social profiles",
                "You can have a professional website / social profiles for $33 and 33 minutes a month",
                "{{website}} can be online and professional again for $33 and 33 minutes a month",
                "{{website}} can be online and professional again for the cost of two 12-packs",
                "Your site can be set up in twenty minutes for the cost of two 12-packs",
            ]
        },
        {
            action: "wait",
            random: [
                { hours: 1 }, { hours: 3 }
            ],
        },

        {
            action: "communication",
            channel: "sms",
            message: [
                "Let me know when you're free. We offer a one-year ROI or your money-back guarantee.",
                "We offer a one-year money-back guarantee on ROI. Let's hop on a quick call so I can explain",
                "Let's hop on a call so I can explain. If you don't turn a profit in a year, we refund you",
                "Let me know when is good for you. We refund one year of service if you don't see ROI",
                "We can hop on a 10 minute call and I can walk you through how it works",
                "Give me a call when you have a sec to discuss our profit guarantee",
            ]
        },
        {
            action: "wait",
            random: [
                { hours: 12 }, { hours: 36 }
            ],
        },
        {
            action: "communication",
            channel: "sms",
            message: [
                "Or do I have the wrong number?",
                "Or are you not {{business_name}}?",
                "Sorry, did I get the wrong number?",
                "Is this not {{business_name}}?",
                "Are you not {{website}}?",
            ]
        },
        {
            action: "wait",
            random: [
                { hours: 18 }, { hours: 24 }
            ]
        },
        {
            action: "communication",
            channel: "sms",
            message: [
                "Sorry for the disruption. I'll update FB/Google/Yelp that this is a closed business.",
                "One last try before I update Google/FB/Yelp/etc with your closure.",
                "Apologies for disturbance. Will update goog/fb/yelp that this is wrong number.",
            ]
        },
    ]
};

module.exports.faux_customer_initial_contact = {
    name: "Faux Customer Initial Customer",
    description: "We're acting like a customer requesting their work in order to determine if they're in business",
    steps: [
        {
            action: "communication",
            channel: "sms",
            message: [
                "Hi, are you taking on new work?",
                "AAre you a {{primary_category_proNoun}}?",
                "Hi, can I get an estimate for a {{primary_category_taskNoun}}?",
                "Do you {{primary_category_taskActionVerb}}?",
                "Are you a {{primary_category_taskAdjective}} pro? I've got a project",
                "I need help with a {{primary_category_taskAdjective}} project. Do you have availability?",
                "Are you a {{primary_category_proNoun}}? Do you take jobs in {{city}}?",
                "Is this {{business_name}}? Are you taking on new jobs?",
                "Howdy! I've got a {{primary_category_taskAdjective}} job near {{zip}}. Do you give quotes?",
                "Are you taking on {{primary_category_taskAdjective}} projects? I'm looking to hire"
            ]
        },
        {
            action: "wait",
            random: [
                { seconds: 8 }, { seconds: 20 }
            ]
        },
        {
            action: "communication",
            channel: "sms",
            message: [
                "George (maybe Jorge?) gave me your number. What's your name",
                "A rep at HD gave me your number. What's your name",
                "I found your number in yellow pages. What's your name",
                "Got your number online but there wasn't much detail. What's your name",
                "What's your name? And what's your availability look like?",
                "Are you in or nearby {{city}}? What's your name?",
                "and what's your name / are you insured in {{state}}?"
            ]
        },
        {
            action: "wait",
            random: [
                { hours: 8 }, { hours: 48 }
            ]

        },
        {
            action: "communication",
            channel: "sms",
            message: [
                "My project isn't urgent so let me know when you're free",
                "Following up -- no worries if you're on a break b/c of COVID",
                "Shoot me a text when you have a minute to chat",
                "I'd love to chat when you have a sec",
                "Did I get the wrong number?",
                "Is this not {{business_name}}?",
                "Are y'all not taking on new work?",
                "Are you not doing work anymore?",
            ]
        },
    ]
};

module.exports.faux_customer_call_response = {
    name: "Faux Customer Call Response",
    description: "Tell the pro we're busy, ask for an email, and tell them we'll call them back.",
    steps: [
        {
            action: "communication",
            channel: "sms",
            message: [
                "Sorry - can't voice right now. I'll call you back in a few hours",
                "Have to call you back",
                "Let me give you a ring later",
                "In the middle of something will call you back a little later",
                "Very loud where I'm at -- will call you in a few hours",
                "Am on a shift so will have to call back when I'm off",
                "I'm working so let me call you once I wrap",
                "Am running errands will call you back",
                "With kids watching movie let me call you after",
                "Am on other line",
                "Have bad reception here will call you later",
                "Just sat down to eat will call you back"
            ]
        },
        {
            action: "wait",
            random: [
                { seconds: 8 }, { seconds: 20 }
            ]
        },
        {
            action: "communication",
            channel: "sms",
            message: [
                "Do you have a website? Shoot me your email and I'll send over proj details later",
                "What's your email so I can send over pics? And do you have a website / yelp / etc?",
                "I can send over pics / details in a bit. What's your email?",
                "Let me email you pics / info. What's your email and do you have a website?",
                "Have a FB / Yelp / website with reviews? And what's your email so I can send you info",
                "I wrote down project details I can send over. What's your email? You have a website or FB?"
            ]
        },
        {
            action: "wait",
            random: [
                { hours: 4 }, { hours: 12 }
            ]

        },
        {
            action: "communication",
            channel: "sms",
            message: [
                "My project isn't urgent but I'd like to get it scheduled",
                "Following up -- would love to send over project info",
                "Do you have time to chat in about half an hour?",
                "Hi! Just checking in. Can I send you over the details?",
                "Hi just following up on last message",
            ]
        },
    ]
};

console.log(JSON.stringify(module.exports.faux_customer_call_response, null, 2));