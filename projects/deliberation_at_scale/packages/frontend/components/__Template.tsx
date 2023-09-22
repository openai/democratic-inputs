interface Props {
    children: React.ReactNode;
}

export default function Template(props: Props) {
    const { children } = props;

    return (
        <div className="flex">
            {children}
        </div>
    );
}
