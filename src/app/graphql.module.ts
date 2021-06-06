import {NgModule} from '@angular/core';
import {APOLLO_OPTIONS} from 'apollo-angular';
import {split, InMemoryCache,ApolloLink} from '@apollo/client/core';
import {HttpLink} from 'apollo-angular/http';
import { setContext } from '@apollo/client/link/context';
import {WebSocketLink} from '@apollo/client/link/ws';
import {getMainDefinition} from '@apollo/client/utilities';
import { SubscriptionClient } from 'subscriptions-transport-ws';
import { Injectable } from '@angular/core';

interface Definintion {
  kind: string;
  operation?: string;
};

@NgModule({
  providers: [
    {
      provide: APOLLO_OPTIONS,
      useFactory(httpLink: HttpLink){
        const auth = setContext(() => ({
            headers: {
              "x-api-key":"da2-puirc5dyvrhzjljjhcdyglhvya",
            },
            payload:{
              "":""
            }
          }))
        const http = httpLink.create({
          uri: 'https://mz2mvhqg7ze5zhbaxiy5g5anpu.appsync-api.ap-northeast-1.amazonaws.com/graphql'
        });
        const wsclient = new SubscriptionClient(
          "wss://mz2mvhqg7ze5zhbaxiy5g5anpu.appsync-realtime-api.ap-northeast-1.amazonaws.com/graphql"
            ,{
            //reconnect: true
          }
        )
        const ws = new WebSocketLink(wsclient);
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
@Injectable({
  providedIn: 'root',
})
export class GraphQLModule {

}
