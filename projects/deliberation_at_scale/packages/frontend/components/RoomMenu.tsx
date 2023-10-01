import { aiRegular, aiSolid, groupRegular, groupSolid } from '@/components/EntityIcons';
import { NavLink } from '@/components/NavLink';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import classNames from 'classnames';
import { useParams } from 'next/navigation';
import { motion } from 'framer-motion';
import { Trans } from '@lingui/macro';

const LinkClassNames = "w-1/2 flex items-center justify-center";

export default function RoomMenu() {
    const params = useParams();
    const currentRoomId = params?.roomId;
    const variants = {
        hidden: { opacity: 0 },
        visible: { opacity: 1 },
    };

    return (
        <motion.nav
            className="flex gap-4 p-4 border-t bg-white"
            variants={variants}
            initial="hidden"
            animate="visible"
        >
            <NavLink
                className={LinkClassNames}
                href={`/${params?.lang}/room/${currentRoomId}/ai`}
            >
                {(active) => (
                    <div
                        className={classNames(
                            "flex items-center gap-2",
                            active ? 'opacity-100' : 'opacity-50 hover:opacity-70',
                        )}
                    >
                        <FontAwesomeIcon icon={active ? aiSolid : aiRegular} />
                        <span><Trans>Assistant</Trans></span>
                    </div>
                )}
            </NavLink>
            <NavLink
                className={LinkClassNames}
                href={`/${params?.lang}/room/${currentRoomId}/chat`}
            >
                {(active) => (
                    <div
                        className={classNames(
                            "flex items-center gap-2",
                            active ? 'opacity-100' : 'opacity-50 hover:opacity-70',
                        )}
                    >
                        <FontAwesomeIcon icon={active ? groupSolid : groupRegular} />
                        <span><Trans>Conversation</Trans></span>
                    </div>
                )}
            </NavLink>
        </motion.nav>
    );
}
