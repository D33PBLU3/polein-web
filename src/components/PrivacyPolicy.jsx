import React, { useEffect } from "react";
import { Navigation } from "./navigation";
import { Contact } from "./contact";

// Turns URLs and email addresses inside a paragraph into links.
const LINK_RE = /(https?:\/\/[^\s]*[^\s.,;)]|[\w.+-]+@[\w-]+(?:\.[\w-]+)+)/g; // trailing punctuation excluded
const linkify = (text) =>
  text.split(LINK_RE).map((part, i) => {
    if (i % 2 === 0) return part;
    const href = part.includes("@") ? `mailto:${part}` : part;
    return (
      <a key={i} href={href} target="_blank" rel="noopener noreferrer">
        {part}
      </a>
    );
  });

// Section content: a string is a paragraph, an array is a bullet list.
const Block = ({ block }) =>
  Array.isArray(block) ? (
    <ul>
      {block.map((item, i) => (
        <li key={i}>{linkify(item)}</li>
      ))}
    </ul>
  ) : (
    <p>{linkify(block)}</p>
  );

const PrivacyPolicy = (props) => {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const data = props.data;
  return (
    <div>
      <Navigation labels={props.navLabels} />
      <div className="privacy-page">
        {data ? (
          <div className="privacy-container">
            <h1>{data.title}</h1>
            <p className="privacy-updated">{data.lastUpdated}</p>
            {data.sections.map((s) => (
              <section key={s.title}>
                <h2>{s.title}</h2>
                {s.content.map((b, i) => (
                  <Block key={i} block={b} />
                ))}
              </section>
            ))}
          </div>
        ) : (
          "loading"
        )}
      </div>
      <Contact {...props.contactProps} />
    </div>
  );
};

export default PrivacyPolicy;
