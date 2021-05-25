import {NgModule} from '@angular/core';
import {APOLLO_OPTIONS} from 'apollo-angular';
//import { HttpLinkModule} from 'apollo-angular-link-http';
import {split,ApolloClientOptions, InMemoryCache,ApolloLink, ApolloClient} from '@apollo/client/core';
import {HttpLink} from 'apollo-angular/http';
import { setContext } from '@apollo/client/link/context';
import {WebSocketLink} from '@apollo/client/link/ws';
import {getMainDefinition} from '@apollo/client/utilities';
import { SubscriptionClient } from 'subscriptions-transport-ws';
//import { Apollo } from 'apollo-angular';
import { Injectable } from '@angular/core';


interface Definintion {
  kind: string;
  operation?: string;
};

@NgModule({
  //exports: [ApolloModule, HttpLinkModule],
  providers: [
    {
      provide: APOLLO_OPTIONS,
      useFactory(httpLink: HttpLink){
        //const cookie3 = cookie
        const auth = setContext(() => ({
            headers: {
              "x-api-key":"da2-puirc5dyvrhzjljjhcdyglhvya",
              "sessionid":"aa"
              //localStorage.getItem('sessionid')
              //"sessionid":this.cookie1.get("sessionid")
              //"sessionid":cookie2.get("sessionid")
            },
            payload:{
              "":""
            }
          }))
        const http = httpLink.create({
          //uri: 'https://mz2mvhqg7ze5zhbaxiy5g5anpu.appsync-api.ap-northeast-1.amazonaws.com/graphql',headers:myheader
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
            error:console.log("this is error",Error),
            /*link:ApolloLink.from([
              createAuthLink({url:'wss://mz2mvhqg7ze5zhbaxiy5g5anpu.appsync-api.ap-northeast-1.amazonaws.com/graphql',region:"ap-northeast-1",auth:auth4}),
              createSubscriptionHandshakeLink("wss://mz2mvhqg7ze5zhbaxiy5g5anpu.appsync-realtime-api.ap-northeast-1.amazonaws.com/graphql")]),*/
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
