import {NgModule} from '@angular/core';
import {APOLLO_OPTIONS} from 'apollo-angular';
//import { HttpLinkModule} from 'apollo-angular-link-http';
import {split,ApolloClientOptions, InMemoryCache,ApolloLink, ApolloClient} from '@apollo/client/core';
import {HttpLink} from 'apollo-angular/http';
import { setContext } from '@apollo/client/link/context';
import {WebSocketLink} from '@apollo/client/link/ws';
import {getMainDefinition} from '@apollo/client/utilities';
import {HttpHeaders} from '@angular/common/http';
import { Apollo } from 'apollo-angular';

interface Definintion {
  kind: string;
  operation?: string;
};
/*
import { createAuthLink, AuthOptions } from 'aws-appsync-auth-link';
import { createSubscriptionHandshakeLink } from 'aws-appsync-subscription-link';

const url = "https://mz2mvhqg7ze5zhbaxiy5g5anpu.appsync-api.ap-northeast-1.amazonaws.com/graphql";
const region = "ap-northeast-1";
const auth: AuthOptions = {
  type: 'API_KEY',
  apiKey: "da2-puirc5dyvrhzjljjhcdyglhvya"
};

const link = ApolloLink.from([
  createAuthLink({ url, region, auth }),
  createSubscriptionHandshakeLink({ url, region, auth })
]);

export const apolloClient = new ApolloClient({
  link,
  cache: new InMemoryCache()
});
*/

//const uri = 'https://mz2mvhqg7ze5zhbaxiy5g5anpu.appsync-api.ap-northeast-1.amazonaws.com/graphql'; // <-- add the URL of the GraphQL server here
const auth = setContext(() => ({
    headers: {
      "x-api-key":"da2-puirc5dyvrhzjljjhcdyglhvya"
    }
  }))

  var myheader = new HttpHeaders();
  myheader.append("x-api-key", "da2-puirc5dyvrhzjljjhcdyglhvya");

@NgModule({
  //exports: [ApolloModule, HttpLinkModule],
  providers: [
    {
      provide: APOLLO_OPTIONS,
      useFactory(httpLink: HttpLink){
        console.log("asdfasf")
        const http = httpLink.create({
          uri: 'https://mz2mvhqg7ze5zhbaxiy5g5anpu.appsync-api.ap-northeast-1.amazonaws.com/graphql',headers:myheader
        });
        const ws = new WebSocketLink({
          uri: 'wss://mz2mvhqg7ze5zhbaxiy5g5anpu.appsync-realtime-api.ap-northeast-1.amazonaws.com/graphql',
          /*  options: {
            reconnect: true,
          },*/
        });
        const link = split(
          ({ query }) => {
    const { kind, operation }: Definintion = getMainDefinition(query);
    return operation === 'subscription';
    },
          ws,
          http
        );
        if(ws){
          return {
            //link:ApolloLink.from([auth,link]),
            link:ApolloLink.from([auth,link]),
            cache: new InMemoryCache()
          }
        }
        else{
          return {
            link:ApolloLink.from([auth,link]),
            cache: new InMemoryCache()
          };
        }

      },
      deps: [HttpLink],
    },
  ],
})

export class GraphQLModule {}
