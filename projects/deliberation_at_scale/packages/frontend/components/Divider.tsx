import { motion } from 'framer-motion';

export default function Divider() {
    // TODO: expand divider to subtle white fade
    return (
        <motion.hr
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
        />
    );
}
