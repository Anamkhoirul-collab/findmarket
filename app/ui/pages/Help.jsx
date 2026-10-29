"use client";

import { Icon, Card } from "../components";

export default function Help({ t }) {
  return (
    <>
      <Card icon={Icon.layers} title={t.howTitle}>
        <ol className="steps">{t.how.map(([a, b]) => <li key={a}><strong>{a}</strong><span>{b}</span></li>)}</ol>
      </Card>
      <div className="grid-2-1">
        <Card icon={Icon.help} title={t.faqTitle}>
          {t.faq.map(([q, a]) => (
            <details className="faq" key={q}><summary>{q}</summary><p>{a}</p></details>
          ))}
        </Card>
        <Card icon={Icon.book} title={t.resources}>
          <ul className="list">
            {t.res.map(([name, desc, url]) => (
              <li key={name}>{Icon.external}
                <span><a href={url} target="_blank" rel="noopener noreferrer" style={{ color: "var(--primary)", fontWeight: 500 }}>{name}</a><br />{desc}</span>
              </li>
            ))}
          </ul>
        </Card>
      </div>
    </>
  );
}
