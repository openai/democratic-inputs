import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import type { Meta, StoryObj } from '@storybook/react';
import {
    aiRegular,
    aiSolid,
    groupRegular,
    groupSolid,
    personRegular,
    personSolid,
    statementRegular,
    statementSolid,
    topicRegular,
    topicSolid
} from '.';
import { faCircle as faCircleSolid, faSquare as faSquareSolid } from '@fortawesome/free-solid-svg-icons';
import { faCircle as faCircleRegular, faSquare as faSquareRegular } from '@fortawesome/free-regular-svg-icons';
import { PropsWithChildren, ReactNode, useState } from 'react';

function ChangeOnHover({ children, hover }: PropsWithChildren<{ hover: ReactNode }>) {
    const [isHovered, setIsHovered] = useState(false);

    return (
        <div onMouseEnter={() => setIsHovered(true)} onMouseLeave={() => setIsHovered(false)}>
            {isHovered ? hover : children }
        </div>
    );
}

const meta: Meta = {
    title: 'EntityIcons',
};

export const Primary: StoryObj = {
    render: function EntityIcons() {
        return (
            <>
                <table className="table-auto">
                    <tr>
                        <th className="p-2 text-left">style</th>
                        <th className="p-2">group</th>
                        <th className="p-2">persons</th>
                        <th className="p-2">statement</th>
                        <th className="p-2">topic</th>
                        <th className="p-2">ai</th>
                        <th className="p-2">faCircle</th>
                        <th className="p-2">faSquare</th>
                    </tr>
                    <tr>
                        <td className="p-2">solid</td>
                        <td className="p-2"><FontAwesomeIcon icon={groupSolid} /></td>
                        <td className="p-2"><FontAwesomeIcon icon={personSolid} /></td>
                        <td className="p-2"><FontAwesomeIcon icon={statementSolid} /></td>
                        <td className="p-2"><FontAwesomeIcon icon={topicSolid} /></td>
                        <td className="p-2"><FontAwesomeIcon icon={aiSolid} /></td>
                        <td className="p-2"><FontAwesomeIcon icon={faCircleSolid} /></td>
                        <td className="p-2"><FontAwesomeIcon icon={faSquareSolid} /></td>
                    </tr>
                    <tr>
                        <td className="p-2">regular</td>
                        <td className="p-2"><FontAwesomeIcon icon={groupRegular} /></td>
                        <td className="p-2"><FontAwesomeIcon icon={personRegular} /></td>
                        <td className="p-2"><FontAwesomeIcon icon={statementRegular} /></td>
                        <td className="p-2"><FontAwesomeIcon icon={topicRegular} /></td>
                        <td className="p-2"><FontAwesomeIcon icon={aiRegular} /></td>
                        <td className="p-2"><FontAwesomeIcon icon={faCircleRegular} /></td>
                        <td className="p-2"><FontAwesomeIcon icon={faSquareRegular} /></td>
                    </tr>
                    <tr>
                        <td className="p-2">hover</td>
                        <td className="p-2">
                            <ChangeOnHover hover={<FontAwesomeIcon icon={groupRegular} />}>
                                <FontAwesomeIcon icon={groupSolid} />
                            </ChangeOnHover>
                        </td>
                        <td className="p-2">
                            <ChangeOnHover hover={<FontAwesomeIcon icon={personRegular} />}>
                                <FontAwesomeIcon icon={personSolid} />
                            </ChangeOnHover>
                        </td>
                        <td className="p-2">
                            <ChangeOnHover hover={<FontAwesomeIcon icon={statementRegular} />}>
                                <FontAwesomeIcon icon={statementSolid} />
                            </ChangeOnHover>
                        </td>
                        <td className="p-2">
                            <ChangeOnHover hover={<FontAwesomeIcon icon={topicRegular} />}>
                                <FontAwesomeIcon icon={topicSolid} />
                            </ChangeOnHover>
                        </td>
                        <td className="p-2">
                            <ChangeOnHover hover={<FontAwesomeIcon icon={aiRegular} />}>
                                <FontAwesomeIcon icon={aiSolid} />
                            </ChangeOnHover>
                        </td>
                        <td className="p-2">
                            <ChangeOnHover hover={<FontAwesomeIcon icon={faCircleRegular} />}>
                                <FontAwesomeIcon icon={faCircleSolid} />
                            </ChangeOnHover>
                        </td>
                        <td className="p-2">
                            <ChangeOnHover hover={<FontAwesomeIcon icon={faSquareRegular} />}>
                                <FontAwesomeIcon icon={faSquareSolid} />
                            </ChangeOnHover>
                        </td>
                    </tr>
                </table>
            </>
        );
    },
};

export default meta;