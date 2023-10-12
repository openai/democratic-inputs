import { Stack, Typography } from '@mui/material'
import { useTracking } from 'react-tracking'

import { useAppSelector, useWeb3Auth } from '@/hooks'
import { selectUserProfile } from '@/slices/user'
import * as pty from '@/types/profile'

export default function ProfilePage() {
  useTracking({ page: 'Profile' })

  const web3Auth = useWeb3Auth()
  const web3AuthUser = web3Auth.user

  const userProfile = useAppSelector(selectUserProfile)

  if (!web3Auth || !web3AuthUser || !userProfile) return <></>

  return (
    <Stack direction="column" spacing={2}>
      <Typography variant="h6" fontWeight="bold" pb={2}>
        Profile
      </Typography>
      <Typography variant="body1" pb={2}>
        Name: {web3AuthUser.name}
      </Typography>
      <Typography variant="body1" pb={2}>
        Email: {web3AuthUser.email}
      </Typography>
      <Typography variant="body1" pb={2}>
        Age Range: {userProfile.ageRange}
      </Typography>
      <Typography variant="body1" pb={2}>
        Gender Identity:{' '}
        {pty.UserProfileGenderIdentity[userProfile.genderIdentity]}
      </Typography>
      <Typography variant="body1" pb={2}>
        Ethnic Background:{' '}
        {pty.UserProfileEthnicBackground[userProfile.ethnicBackground]}
      </Typography>
      <Typography variant="body1" pb={2}>
        Enrolled in Education:{' '}
        {userProfile.isEnrolledInEducation ? 'Yes' : 'No'}
      </Typography>
      <Typography variant="body1" pb={2}>
        Highest Education Level:{' '}
        {pty.UserProfileEducationLevel[userProfile.highestLevelEducation]}
      </Typography>
    </Stack>
  )
}
