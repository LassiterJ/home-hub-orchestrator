import styled from 'styled-components'

import { Label } from '@home-hub-orchestrator/ui'

import * as Styled from './styled'

import { useTRPC } from '../../../utils/trpc'
import {useQuery} from "@tanstack/react-query";

export const Home = () => {
   const trpc = useTRPC()
   const queryOptions = trpc.getRole.queryOptions();
   const {data} = useQuery(queryOptions);

   return (
      <HomeContainer>
         <Label>Current role: {data?.role}</Label>
         <Styled.Gif
            src="https://media.giphy.com/media/Dh5q0sShxgp13DwrvG/giphy.gif"
            alt="I have no idea what I'm doing"
         />
      </HomeContainer>
   )
}

const HomeContainer = styled.div`
   display: flex;
   flex-direction: column;
   align-items: center;
   justify-content: center;
   min-height: 100vh;
   background: linear-gradient(to right, #434343, #000000);
`
