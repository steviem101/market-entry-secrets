interface InlineCitationProps {
  number: number;
  label?: string;
}

export const InlineCitation = ({ number, label }: InlineCitationProps) => {
  return (
    <sup className="ml-0.5">
      <a
        href={`#cite-${number}`}
        className="text-primary hover:underline font-medium"
        aria-label={label ? `Source ${number}: ${label}` : `Source ${number}`}
      >
        [{number}]
      </a>
    </sup>
  );
};
